#!/bin/bash
# create-role-history.sh
# Creates many accounts with various roles and generates comprehensive role transfer history

set -e

CONTRACT_ID="CAOLL3NFZA62ZROJSYL23WKKNGWBE3JYCI7UIHR6EWJHPPOAY4JKFXU5"
ADMIN_SOURCE="new-owner"  # The admin identity
NETWORK="testnet"

# Get the admin address
ADMIN_ADDR=$(soroban keys address $ADMIN_SOURCE)

# Define all available roles (must match the contract)
ROLES=("minter" "burner" "pauser" "viewer" "transfer" "approver" "operator")

# Number of accounts to create
NUM_ACCOUNTS=25

echo "=============================================="
echo "Creating Role History for Contract: $CONTRACT_ID"
echo "Admin: $ADMIN_SOURCE ($ADMIN_ADDR)"
echo "Number of accounts to create: $NUM_ACCOUNTS"
echo "=============================================="

# Array to store created account names
declare -a ACCOUNTS

# Phase 1: Create accounts and fund them
echo ""
echo "=== PHASE 1: Creating and funding accounts ==="
for i in $(seq 1 $NUM_ACCOUNTS); do
    ACCOUNT_NAME="acct$i"
    ACCOUNTS+=("$ACCOUNT_NAME")
    
    # Check if key already exists
    if soroban keys address "$ACCOUNT_NAME" &>/dev/null; then
        echo "[$i/$NUM_ACCOUNTS] Account $ACCOUNT_NAME already exists"
    else
        echo "[$i/$NUM_ACCOUNTS] Generating keypair for $ACCOUNT_NAME..."
        soroban keys generate "$ACCOUNT_NAME" --network $NETWORK
    fi
    
    # Fund the account
    echo "  Funding $ACCOUNT_NAME..."
    soroban keys fund "$ACCOUNT_NAME" --network $NETWORK 2>/dev/null || echo "  (already funded)"
done

# Phase 2: Grant initial roles - round robin across all roles
echo ""
echo "=== PHASE 2: Granting initial roles ==="
for i in $(seq 1 $NUM_ACCOUNTS); do
    ACCOUNT_NAME="acct$i"
    ACCOUNT_ADDR=$(soroban keys address "$ACCOUNT_NAME")
    
    # Primary role based on index
    ROLE_INDEX=$(( (i - 1) % ${#ROLES[@]} ))
    PRIMARY_ROLE="${ROLES[$ROLE_INDEX]}"
    
    echo "[$i/$NUM_ACCOUNTS] Granting $PRIMARY_ROLE to $ACCOUNT_NAME ($ACCOUNT_ADDR)"
    soroban contract invoke \
        --id $CONTRACT_ID \
        --source $ADMIN_SOURCE \
        --network $NETWORK \
        -- grant_role \
        --caller "$ADMIN_ADDR" \
        --role "$PRIMARY_ROLE" \
        --account "$ACCOUNT_ADDR" || echo "  (grant failed, continuing...)"
    
    sleep 0.5  # Small delay to avoid rate limiting
done

# Phase 3: Grant secondary roles to some accounts (every 3rd account)
echo ""
echo "=== PHASE 3: Granting secondary roles ==="
for i in $(seq 3 3 $NUM_ACCOUNTS); do
    ACCOUNT_NAME="acct$i"
    ACCOUNT_ADDR=$(soroban keys address "$ACCOUNT_NAME")
    
    # Secondary role - different from primary
    ROLE_INDEX=$(( (i + 2) % ${#ROLES[@]} ))
    SECONDARY_ROLE="${ROLES[$ROLE_INDEX]}"
    
    echo "[$i] Granting secondary role $SECONDARY_ROLE to $ACCOUNT_NAME"
    soroban contract invoke \
        --id $CONTRACT_ID \
        --source $ADMIN_SOURCE \
        --network $NETWORK \
        -- grant_role \
        --caller "$ADMIN_ADDR" \
        --role "$SECONDARY_ROLE" \
        --account "$ACCOUNT_ADDR" || echo "  (grant failed, continuing...)"
    
    sleep 0.5
done

# Phase 4: Grant tertiary roles to some accounts (every 5th account)
echo ""
echo "=== PHASE 4: Granting tertiary roles ==="
for i in $(seq 5 5 $NUM_ACCOUNTS); do
    ACCOUNT_NAME="acct$i"
    ACCOUNT_ADDR=$(soroban keys address "$ACCOUNT_NAME")
    
    # Tertiary role - different from primary and secondary
    ROLE_INDEX=$(( (i + 4) % ${#ROLES[@]} ))
    TERTIARY_ROLE="${ROLES[$ROLE_INDEX]}"
    
    echo "[$i] Granting tertiary role $TERTIARY_ROLE to $ACCOUNT_NAME"
    soroban contract invoke \
        --id $CONTRACT_ID \
        --source $ADMIN_SOURCE \
        --network $NETWORK \
        -- grant_role \
        --caller "$ADMIN_ADDR" \
        --role "$TERTIARY_ROLE" \
        --account "$ACCOUNT_ADDR" || echo "  (grant failed, continuing...)"
    
    sleep 0.5
done

# Phase 5: Revoke some roles to create revocation history (every 4th account)
echo ""
echo "=== PHASE 5: Revoking some roles (creating revocation history) ==="
for i in $(seq 4 4 $NUM_ACCOUNTS); do
    ACCOUNT_NAME="acct$i"
    ACCOUNT_ADDR=$(soroban keys address "$ACCOUNT_NAME")
    
    # Revoke primary role
    ROLE_INDEX=$(( (i - 1) % ${#ROLES[@]} ))
    ROLE_TO_REVOKE="${ROLES[$ROLE_INDEX]}"
    
    echo "[$i] Revoking $ROLE_TO_REVOKE from $ACCOUNT_NAME"
    soroban contract invoke \
        --id $CONTRACT_ID \
        --source $ADMIN_SOURCE \
        --network $NETWORK \
        -- revoke_role \
        --caller "$ADMIN_ADDR" \
        --role "$ROLE_TO_REVOKE" \
        --account "$ACCOUNT_ADDR" || echo "  (revoke failed, continuing...)"
    
    sleep 0.5
done

# Phase 6: Re-grant some revoked roles (every 8th account)
echo ""
echo "=== PHASE 6: Re-granting some previously revoked roles ==="
for i in $(seq 8 8 $NUM_ACCOUNTS); do
    ACCOUNT_NAME="acct$i"
    ACCOUNT_ADDR=$(soroban keys address "$ACCOUNT_NAME")
    
    # Re-grant the same role
    ROLE_INDEX=$(( (i - 1) % ${#ROLES[@]} ))
    ROLE_TO_GRANT="${ROLES[$ROLE_INDEX]}"
    
    echo "[$i] Re-granting $ROLE_TO_GRANT to $ACCOUNT_NAME"
    soroban contract invoke \
        --id $CONTRACT_ID \
        --source $ADMIN_SOURCE \
        --network $NETWORK \
        -- grant_role \
        --caller "$ADMIN_ADDR" \
        --role "$ROLE_TO_GRANT" \
        --account "$ACCOUNT_ADDR" || echo "  (grant failed, continuing...)"
    
    sleep 0.5
done

# Phase 7: Some accounts renounce their own roles
echo ""
echo "=== PHASE 7: Some accounts renouncing their own roles ==="
for i in $(seq 7 7 $NUM_ACCOUNTS); do
    ACCOUNT_NAME="acct$i"
    ACCOUNT_ADDR=$(soroban keys address "$ACCOUNT_NAME")
    
    # Get their primary role to renounce
    ROLE_INDEX=$(( (i - 1) % ${#ROLES[@]} ))
    ROLE_TO_RENOUNCE="${ROLES[$ROLE_INDEX]}"
    
    echo "[$i] $ACCOUNT_NAME renouncing $ROLE_TO_RENOUNCE"
    soroban contract invoke \
        --id $CONTRACT_ID \
        --source "$ACCOUNT_NAME" \
        --network $NETWORK \
        -- renounce_role \
        --role "$ROLE_TO_RENOUNCE" \
        --caller "$ACCOUNT_ADDR" || echo "  (renounce failed, continuing...)"
    
    sleep 0.5
done

# Phase 8: Execute some operations to generate more events
echo ""
echo "=== PHASE 8: Executing operations (minting, burning, pausing) ==="

# Find a minter account
for i in $(seq 1 $NUM_ACCOUNTS); do
    ACCOUNT_NAME="acct$i"
    ROLE_INDEX=$(( (i - 1) % ${#ROLES[@]} ))
    if [ "${ROLES[$ROLE_INDEX]}" == "minter" ]; then
        MINTER_ACCOUNT="$ACCOUNT_NAME"
        MINTER_ADDR=$(soroban keys address "$ACCOUNT_NAME")
        echo "Found minter: $MINTER_ACCOUNT ($MINTER_ADDR)"
        
        # Mint some tokens
        echo "Minting tokens..."
        for j in 1 2 3; do
            RECIPIENT=$(soroban keys address "acct$((j * 2))")
            soroban contract invoke \
                --id $CONTRACT_ID \
                --source "$MINTER_ACCOUNT" \
                --network $NETWORK \
                -- mint \
                --caller "$MINTER_ADDR" \
                --to "$RECIPIENT" \
                --amount $((j * 1000)) || echo "  (mint failed)"
            sleep 0.5
        done
        break
    fi
done

# Find a burner account
for i in $(seq 1 $NUM_ACCOUNTS); do
    ACCOUNT_NAME="acct$i"
    ROLE_INDEX=$(( (i - 1) % ${#ROLES[@]} ))
    if [ "${ROLES[$ROLE_INDEX]}" == "burner" ]; then
        BURNER_ACCOUNT="$ACCOUNT_NAME"
        BURNER_ADDR=$(soroban keys address "$ACCOUNT_NAME")
        echo "Found burner: $BURNER_ACCOUNT ($BURNER_ADDR)"
        
        # Burn some tokens
        echo "Burning tokens..."
        for j in 1 2; do
            TARGET=$(soroban keys address "acct$((j * 2))")
            soroban contract invoke \
                --id $CONTRACT_ID \
                --source "$BURNER_ACCOUNT" \
                --network $NETWORK \
                -- burn \
                --caller "$BURNER_ADDR" \
                --from "$TARGET" \
                --amount 100 || echo "  (burn failed)"
            sleep 0.5
        done
        break
    fi
done

# Find a pauser account and pause/unpause
for i in $(seq 1 $NUM_ACCOUNTS); do
    ACCOUNT_NAME="acct$i"
    ROLE_INDEX=$(( (i - 1) % ${#ROLES[@]} ))
    if [ "${ROLES[$ROLE_INDEX]}" == "pauser" ]; then
        PAUSER_ACCOUNT="$ACCOUNT_NAME"
        PAUSER_ADDR=$(soroban keys address "$ACCOUNT_NAME")
        echo "Found pauser: $PAUSER_ACCOUNT ($PAUSER_ADDR)"
        
        echo "Pausing contract..."
        soroban contract invoke \
            --id $CONTRACT_ID \
            --source "$PAUSER_ACCOUNT" \
            --network $NETWORK \
            -- pause \
            --caller "$PAUSER_ADDR" || echo "  (pause failed)"
        
        sleep 1
        
        echo "Unpausing contract..."
        soroban contract invoke \
            --id $CONTRACT_ID \
            --source "$PAUSER_ACCOUNT" \
            --network $NETWORK \
            -- unpause \
            --caller "$PAUSER_ADDR" || echo "  (unpause failed)"
        break
    fi
done

echo ""
echo "=============================================="
echo "Role history generation complete!"
echo "Contract: $CONTRACT_ID"
echo "Total accounts created: $NUM_ACCOUNTS"
echo ""
echo "Summary of operations:"
echo "- Created and funded $NUM_ACCOUNTS accounts"
echo "- Granted primary roles to all accounts"
echo "- Granted secondary roles to ~8 accounts"
echo "- Granted tertiary roles to ~5 accounts"
echo "- Revoked roles from ~6 accounts"
echo "- Re-granted roles to ~3 accounts"
echo "- Had ~3 accounts renounce their roles"
echo "- Executed various operations (mint, burn, pause/unpause)"
echo "=============================================="
