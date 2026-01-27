#!/bin/bash
# ============================================
# NOKTA STRIPE PRODUCT & PRICES SETUP
# Run: chmod +x setup-stripe.sh && ./setup-stripe.sh
# ============================================

# Your Stripe Secret Key (test mode)
STRIPE_SK="sk_test_51SKjgjAMF4ixGcvos4ECGHN3G2OFdU2VaBDj5lWybrfmH4vokgDqYtomvVgmiDBc3OoXoTzb2XR4Dk7infsxT48z00NK9fSX09"

ENV_FILE=".env.local"
FORCE_RECREATE=${FORCE_RECREATE:-false}
FORCE_RECREATE_CURRENCIES=${FORCE_RECREATE_CURRENCIES:-""}

get_env_value() {
  local key=$1
  if [ -f "$ENV_FILE" ]; then
    grep "^${key}=" "$ENV_FILE" | tail -1 | cut -d'=' -f2-
  fi
}

should_recreate_currency() {
  local upper_currency=$1
  if [ "$FORCE_RECREATE" = "true" ]; then
    return 0
  fi
  if [ -z "$FORCE_RECREATE_CURRENCIES" ]; then
    return 1
  fi
  echo ",$FORCE_RECREATE_CURRENCIES," | tr '[:lower:]' '[:upper:]' | grep -q ",$upper_currency,"
}

echo "🚀 Setting up Nokta One Stripe Products..."
echo ""

# ============================================
# STEP 1: Create Product
# ============================================
echo "📦 Creating product..."

PRODUCT_ID=$(get_env_value "STRIPE_PRODUCT_PREMIUM")

if [ -n "$PRODUCT_ID" ]; then
  echo "✅ Using existing product: $PRODUCT_ID"
  echo ""
else
  PRODUCT_RESPONSE=$(curl -s https://api.stripe.com/v1/products \
    -u "$STRIPE_SK:" \
    -d "name=Nokta One Premium" \
    -d "description=Accès illimité à Nokta One - Body Reset System. Skanes illimités, historique complet, insights personnalisés." \
    -d "metadata[app]=nokta_one" \
    -d "metadata[tier]=premium")

  PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id": *"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$PRODUCT_ID" ]; then
    echo "❌ Failed to create product"
    echo $PRODUCT_RESPONSE
    exit 1
  fi

  echo "✅ Product created: $PRODUCT_ID"
  echo ""
fi

# ============================================
# STEP 2: Create Prices for each currency
# ============================================
echo "💰 Creating prices..."
echo ""

# Arrays to store results (bash 3 compatible)
CURRENCY_CODES=()
MONTHLY_IDS=()
ANNUAL_IDS=()

# Function to create price
create_price() {
  local currency=$1
  local monthly_amount=$2
  local annual_amount=$3
  local is_zero_decimal=${4:-false}
  local upper_currency
  upper_currency=$(echo "$currency" | tr '[:lower:]' '[:upper:]')

  if ! should_recreate_currency "$upper_currency"; then
    local existing_monthly
    local existing_annual
    existing_monthly=$(get_env_value "STRIPE_PRICE_MONTHLY_${upper_currency}")
    existing_annual=$(get_env_value "STRIPE_PRICE_ANNUAL_${upper_currency}")

    if [ -n "$existing_monthly" ] && [ -n "$existing_annual" ]; then
      echo "   ✅ $currency already set in $ENV_FILE, skipping"
      return
    fi
  fi
  
  echo "   Creating $currency..."
  
  # Monthly price
  MONTHLY_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
    -u "$STRIPE_SK:" \
    -d "product=$PRODUCT_ID" \
    -d "currency=$currency" \
    -d "unit_amount=$monthly_amount" \
    -d "recurring[interval]=month" \
    -d "metadata[plan_type]=monthly" \
    -d "metadata[app]=nokta_one")
  
  MONTHLY_ID=$(echo $MONTHLY_RESPONSE | grep -o '"id": *"[^"]*"' | head -1 | cut -d'"' -f4)
  
  # Annual price
  ANNUAL_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
    -u "$STRIPE_SK:" \
    -d "product=$PRODUCT_ID" \
    -d "currency=$currency" \
    -d "unit_amount=$annual_amount" \
    -d "recurring[interval]=year" \
    -d "metadata[plan_type]=annual" \
    -d "metadata[app]=nokta_one" \
    -d "metadata[savings_percent]=26")
  
  ANNUAL_ID=$(echo $ANNUAL_RESPONSE | grep -o '"id": *"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -n "$MONTHLY_ID" ] && [ -n "$ANNUAL_ID" ]; then
    echo "   ✅ $currency Monthly: $MONTHLY_ID"
    echo "   ✅ $currency Annual:  $ANNUAL_ID"
    CURRENCY_CODES+=("$upper_currency")
    MONTHLY_IDS+=("$MONTHLY_ID")
    ANNUAL_IDS+=("$ANNUAL_ID")
  else
    echo "   ❌ $currency failed"
  fi
}

# ============================================
# TIER 1: Major Markets
# ============================================
echo "📍 Tier 1: Major Markets"
create_price "usd" 1899 16900      # $18.99/month, $169/year
create_price "eur" 1899 16900      # €18.99/month, €169/year
create_price "gbp" 1599 13900      # £15.99/month, £139/year

# ============================================
# TIER 2: Major International
# ============================================
echo ""
echo "📍 Tier 2: Major International"
create_price "cad" 2599 22900      # CA$25.99/month, CA$229/year
create_price "aud" 2999 26900      # A$29.99/month, A$269/year
create_price "chf" 1790 15900      # CHF 17.90/month, CHF 159/year

# ============================================
# TIER 3: Asia-Pacific
# ============================================
echo ""
echo "📍 Tier 3: Asia-Pacific"
create_price "jpy" 2900 25900      # ¥2,900/month, ¥25,900/year (zero decimal)
create_price "cny" 13800 119900    # ¥138/month, ¥1,199/year
create_price "hkd" 14800 129900    # HK$148/month, HK$1,299/year
create_price "sgd" 2590 22900      # S$25.90/month, S$229/year
create_price "krw" 25900 229000    # ₩25,900/month, ₩229,000/year (zero decimal)
create_price "inr" 159900 1399900  # ₹1,599/month, ₹13,999/year

# ============================================
# TIER 4: Latin America
# ============================================
echo ""
echo "📍 Tier 4: Latin America"
create_price "brl" 9990 89900      # R$99.90/month, R$899/year
create_price "mxn" 34900 299900    # MX$349/month, MX$2,999/year

# ============================================
# TIER 5: Other European
# ============================================
echo ""
echo "📍 Tier 5: Other European"
create_price "sek" 19900 174900    # 199 kr/month, 1749 kr/year
create_price "nok" 19900 174900    # 199 kr/month, 1749 kr/year
create_price "dkk" 13900 119900    # 139 kr/month, 1199 kr/year
create_price "pln" 7999 69900      # 79.99 zł/month, 699 zł/year
create_price "czk" 44900 399900    # 449 Kč/month, 3999 Kč/year

# ============================================
# TIER 6: Middle East & Africa
# ============================================
echo ""
echo "📍 Tier 6: Middle East & Africa"
create_price "aed" 6999 61900      # AED 69.99/month, AED 619/year
create_price "ils" 6990 61900      # ₪69.90/month, ₪619/year
create_price "zar" 34900 299900    # R349/month, R2,999/year

# ============================================
# TIER 7: Emerging Markets
# ============================================
echo ""
echo "📍 Tier 7: Emerging Markets"
create_price "try" 59900 529900    # ₺599/month, ₺5,299/year
create_price "thb" 64900 579900    # ฿649/month, ฿5,799/year
create_price "php" 109900 949900   # ₱1,099/month, ₱9,499/year
create_price "idr" 299000 2599000  # Rp299.000/month, Rp2.599.000/year (zero decimal)
create_price "myr" 8990 79900      # RM89.90/month, RM799/year
create_price "vnd" 479000 4199000  # 479.000₫/month, 4.199.000₫/year (zero decimal)

# ============================================
# TIER 8: Additional Markets
# ============================================
echo ""
echo "📍 Tier 8: Additional Markets"
create_price "nzd" 3299 28900      # NZ$32.99/month, NZ$289/year
create_price "twd" 599 5299        # NT$599/month, NT$5,299/year (zero decimal)
create_price "huf" 6990 61900      # 6,990 Ft/month, 61,900 Ft/year (zero decimal)
create_price "ron" 8990 79900      # 89.90 lei/month, 799 lei/year

# ============================================
# OUTPUT RESULTS
# ============================================
echo ""
echo "============================================"
echo "✅ SETUP COMPLETE!"
echo "============================================"
echo ""
echo "Product ID: $PRODUCT_ID"
echo ""
echo "============================================"
echo "📋 Add to .env.local:"
echo "============================================"
echo ""
echo "STRIPE_PRODUCT_PREMIUM=$PRODUCT_ID"
echo ""
echo "# Default prices (USD)"
USD_MONTHLY=$(get_env_value "STRIPE_PRICE_MONTHLY_USD")
USD_ANNUAL=$(get_env_value "STRIPE_PRICE_ANNUAL_USD")
echo "STRIPE_PRICE_MONTHLY=${USD_MONTHLY:-$(get_env_value "STRIPE_PRICE_MONTHLY")}"
echo "STRIPE_PRICE_ANNUAL=${USD_ANNUAL:-$(get_env_value "STRIPE_PRICE_ANNUAL")}"
echo ""
echo "STRIPE_TRIAL_DAYS=10"
echo ""

echo "============================================"
echo "📋 Price IDs by Currency:"
echo "============================================"
echo ""
echo "export const STRIPE_PRICE_IDS = {"
echo "  monthly: {"
for i in "${!CURRENCY_CODES[@]}"; do
  echo "    ${CURRENCY_CODES[$i]}: '${MONTHLY_IDS[$i]}',"
done
echo "  },"
echo "  annual: {"
for i in "${!CURRENCY_CODES[@]}"; do
  echo "    ${CURRENCY_CODES[$i]}: '${ANNUAL_IDS[$i]}',"
done
echo "  },"
echo "};"
echo ""

echo "============================================"
echo "📊 PRICING SUMMARY"
echo "============================================"
echo ""
echo "Currency | Monthly     | Annual"
echo "---------|-------------|-------------"
echo "USD      | \$18.99     | \$169"
echo "EUR      | €18.99      | €169"
echo "GBP      | £15.99      | £139"
echo "CAD      | CA\$25.99   | CA\$229"
echo "AUD      | A\$29.99    | A\$269"
echo "CHF      | CHF 17.90   | CHF 159"
echo "JPY      | ¥2,900      | ¥25,900"
echo "... and ${#MONTHLY_PRICES[@]} more currencies"
echo ""

echo "🎉 Done! Check your Stripe Dashboard:"
echo "   https://dashboard.stripe.com/test/products"
