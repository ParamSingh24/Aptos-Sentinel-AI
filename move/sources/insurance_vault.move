module sentinel_ai::insurance_vault {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::randomness;
    use aptos_framework::timestamp;
    
    
    /// User has not staked enough
    const EINSUFFICIENT_STAKE: u64 = 1;
    /// Randomness request failed
    const ETAG_RANDOMNESS_FAILED: u64 = 2;
    /// User is not insured
    const ENOT_INSURED: u64 = 3;

    struct Vault has key {
        balance: coin::Coin<AptosCoin>,
    }

    struct InsurancePolicy has key {
        amount: u64,
        timestamp: u64,
    }

    /// Initialize the vault
    fun init_module(account: &signer) {
        move_to(account, Vault {
            balance: coin::zero(),
        });
    }

    /// User pays premium to get insured
    public entry fun stake_for_insurance(user: &signer, amount: u64) acquires Vault, InsurancePolicy {
        let user_addr = signer::address_of(user);
        
        let payment = coin::withdraw<AptosCoin>(user, amount);
        let vault = borrow_global_mut<Vault>(@sentinel_ai);
        coin::merge(&mut vault.balance, payment);

        if (exists<InsurancePolicy>(user_addr)) {
            let policy = borrow_global_mut<InsurancePolicy>(user_addr);
            policy.amount = policy.amount + amount;
            policy.timestamp = timestamp::now_seconds();
        } else {
            move_to(user, InsurancePolicy {
                amount: amount,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Simulate a claim payout using on-chain randomness
    #[randomness]
    entry fun claim_payout(user: &signer) acquires Vault, InsurancePolicy {
        let user_addr = signer::address_of(user);
        assert!(exists<InsurancePolicy>(user_addr), ENOT_INSURED);
        
        // Use on-chain randomness to determine if claim is valid (e.g., 10% chance)
        let random_val = randomness::u64_range(0, 100);
        
        if (random_val < 10) {
            // Pay out 2x of held insurance amount (simplified logic)
            let policy = borrow_global_mut<InsurancePolicy>(user_addr);
            let payout_amount = policy.amount * 2;
            
            let vault = borrow_global_mut<Vault>(@sentinel_ai);
            // Ensure vault has funds, otherwise pay what's left
            let vault_val = coin::value(&vault.balance);
            if (vault_val < payout_amount) {
                payout_amount = vault_val;
            };

            let payout = coin::extract(&mut vault.balance, payout_amount);
            coin::deposit(user_addr, payout);
            
            // Reset policy
            policy.amount = 0;
        }
    }
}
