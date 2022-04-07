use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::instruction::CounterInstruction;
use crate::state::Counter;

pub struct Processor {}

impl Processor {
    pub fn process_instruction(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = CounterInstruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        match instruction {
            CounterInstruction::Increment => {
                msg!("Instruction: Increment");
                let accounts_iter = &mut accounts.iter();  // Create a pointer to an iterator over accounts
                let counter_ai = next_account_info(accounts_iter)?;  // next_account_info is used to go through an iterator of accounts
                let mut counter = Counter::try_from_slice(&counter_ai.data.borrow())?;  // Function used to deserialize raw account data into an object
                counter.count += 1; // In the localize copy of the buffer, count variable has increased
                counter.serialize(&mut *counter_ai.data.borrow_mut())?;  // Serialize the data back to the original account encoding

                // Proccess: Copy data into an object, modify the object, and write the data back to the account 
            }
        }
        Ok(())
    }
}
