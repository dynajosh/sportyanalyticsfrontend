export const processBettingData = (rawData) => {
    const grouped = {};
    
    rawData.forEach(bet => {
      const date = new Date(bet.createTime);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      // Convert string values to numbers and extract match info
      const processedBet = {
        orderId: bet.orderId,
        shortId: bet.shortId,
        orderType: bet.orderType,
        totalStake: parseFloat(bet.totalStake),
        totalWinnings: parseFloat(bet.totalWinnings),
        winningStatus: bet.winningStatus,
        selectionSize: bet.selectionSize,
        createTime: bet.createTime,
        match: bet.selections.length > 0 ? `${bet.selections[0].home} vs ${bet.selections[0].away}` : 'Unknown Match',
        market: bet.selections.length > 0 ? bet.selections[0].outcomeDesc : 'Unknown Market',
        odds: bet.selections.length > 0 ? parseFloat(bet.selections[0].odds) : 0,
        score: bet.selections.length > 0 ? bet.selections[0].setScore : 'N/A',
        selections: bet.selections
      };
      
      grouped[dateKey].push(processedBet);
    });
    
    return Object.entries(grouped).map(([date, bets]) => ({
      date,
      bets
    }));
  };



export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };