class FeeTransactionDTO {
  static toClient(transaction) {
    return {
      id: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      balanceAfter: transaction.balanceAfter,
      transactionDate: transaction.transactionDate,
    };
  }

  static toClientList(transactions) {
    return transactions.map(t => this.toClient(t));
  }
}

module.exports = FeeTransactionDTO;
