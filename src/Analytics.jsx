import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import {processBettingData, formatCurrency} from './utils/processbettingData';
import { getFirstDayOfMonth, getDaysInMonth, formatDateKey } from './utils/handleDates';
import { getCellBackground } from './utils/getCellBG';

const BettingCalendar = ({ rawBettingData }) => {
  // Process the raw data into grouped by date format
  
  const bettingData = processBettingData(rawBettingData);

  const [currentDate, setCurrentDate] = useState(new Date(2025, 7)); // August 2025
  const [selectedDate, setSelectedDate] = useState(null);
  const today = new Date();

  // Process betting data by date
  const processedData = useMemo(() => {
    const dataMap = {};
    
    bettingData.forEach(dayData => {
      const totalStake = dayData.bets.reduce((sum, bet) => sum + bet.totalStake, 0);
      const totalWinnings = dayData.bets.reduce((sum, bet) => sum + bet.totalWinnings, 0);
      const netPnL = totalWinnings - totalStake;
      const returnPercentage = totalStake > 0 ? ((netPnL / totalStake) * 100) : 0;
      
      dataMap[dayData.date] = {
        totalStake,
        totalWinnings,
        netPnL,
        returnPercentage,
        betsCount: dayData.bets.length,
        bets: dayData.bets
      };
    });
    
    return dataMap;
  }, [bettingData]);

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      const dayData = processedData[dateKey];
      const cellDate = new Date(year, month, day);
      const isToday = cellDate.toDateString() === today.toDateString();
      const isFuture = cellDate > today;
      const isSelected = selectedDate === dateKey;

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-300 p-2 ${getCellBackground(dateKey, isToday, isFuture, isSelected, processedData)} relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors`}
          onClick={() => {
            if (dayData) {
              setSelectedDate(selectedDate === dateKey ? null : dateKey);
            }
          }}
        >
          <div className="font-semibold text-sm mb-1">{day}</div>
          
          {dayData && (
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Bets:</span>
                <span className="font-medium">{dayData.betsCount}</span>
              </div>
              
              <div className="space-y-0.5">
                <div className="text-gray-700">
                  Stake: {formatCurrency(dayData.totalStake)}
                </div>
                <div className={`font-medium ${dayData.netPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  PnL: {formatCurrency(dayData.netPnL)}
                </div>
                <div className={`text-xs flex items-center gap-1 ${dayData.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dayData.returnPercentage >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {dayData.returnPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
          
          {dayData && (
            <div className="absolute bottom-1 right-1 text-xs text-gray-400">
              Click for details
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(name => (
          <div key={name} className="text-center font-semibold py-2 bg-gray-200 text-gray-700">
            {name}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthlyStats = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    let totalStake = 0;
    let totalWinnings = 0;
    let totalBets = 0;
    let winningDays = 0;
    let losingDays = 0;
    
    Object.entries(processedData).forEach(([dateKey, dayData]) => {
      const [dateYear, dateMonth] = dateKey.split('-').map(Number);
      if (dateYear === year && dateMonth === month + 1) {
        totalStake += dayData.totalStake;
        totalWinnings += dayData.totalWinnings;
        totalBets += dayData.betsCount;
        
        if (dayData.netPnL > 0) winningDays++;
        else if (dayData.netPnL < 0) losingDays++;
      }
    });
    
    const netPnL = totalWinnings - totalStake;
    const returnPercentage = totalStake > 0 ? ((netPnL / totalStake) * 100) : 0;
    
    return {
      totalStake,
      totalWinnings,
      netPnL,
      returnPercentage,
      totalBets,
      winningDays,
      losingDays
    };
  }, [currentDate, processedData]);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Betting PnL Tracker</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-700 min-w-48 text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{monthlyStats.totalBets}</div>
            <div className="text-sm text-blue-600">Total Bets</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-lg font-bold text-purple-700">{formatCurrency(monthlyStats.totalStake)}</div>
            <div className="text-sm text-purple-600">Total Stake</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-lg font-bold text-yellow-700">{formatCurrency(monthlyStats.totalWinnings)}</div>
            <div className="text-sm text-yellow-600">Total Winnings</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${monthlyStats.netPnL >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`text-lg font-bold ${monthlyStats.netPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(monthlyStats.netPnL)}
            </div>
            <div className={`text-sm ${monthlyStats.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>Net PnL</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${monthlyStats.returnPercentage >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`text-lg font-bold ${monthlyStats.returnPercentage >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {monthlyStats.returnPercentage.toFixed(1)}%
            </div>
            <div className={`text-sm ${monthlyStats.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>Return %</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{monthlyStats.winningDays}</div>
            <div className="text-sm text-green-600">Winning Days</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">{monthlyStats.losingDays}</div>
            <div className="text-sm text-red-600">Losing Days</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-gray-300"></div>
            <span>Winning Days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-gray-300"></div>
            <span>Losing Days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300"></div>
            <span>No Bets / Break Even</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-300"></div>
            <span>Future Days</span>
          </div>
        </div>

        {/* Calendar */}
        {renderCalendar()}

        {/* Detailed Daily View - Only show when a day is selected */}
        {selectedDate && processedData[selectedDate] && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Betting Activity for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close Details
              </button>
            </div>
            
            {(() => {
              const dayData = processedData[selectedDate];
              return (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">{dayData.betsCount}</div>
                        <div className="text-sm text-blue-600">Total Bets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-700">{formatCurrency(dayData.totalStake)}</div>
                        <div className="text-sm text-purple-600">Total Stake</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-700">{formatCurrency(dayData.totalWinnings)}</div>
                        <div className="text-sm text-yellow-600">Total Winnings</div>
                      </div>
                      <div className={`text-center ${dayData.netPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        <div className="text-lg font-bold">
                          {formatCurrency(dayData.netPnL)} ({dayData.returnPercentage > 0 ? '+' : ''}{dayData.returnPercentage.toFixed(1)}%)
                        </div>
                        <div className="text-sm">Net PnL</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    {dayData.bets.map((bet, index) => (
                      <div key={bet.orderId || index} className="p-3 bg-white rounded-lg shadow-sm border-l-4 border-l-blue-400">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-base mb-1">{bet.match}</div>
                            <div className="text-sm text-gray-700 mb-2">
                              <span className="font-medium">{bet.market}</span> @ <span className="font-medium">{bet.odds}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>
                                {bet.orderType === 1 ? 'Single Bet' : `${bet.selectionSize}-fold Accumulator`}
                              </span>
                              <span>Order ID: {bet.shortId}</span>
                              {bet.score && <span>Final Score: {bet.score}</span>}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Placed at: {new Date(bet.createTime).toLocaleTimeString('en-US', { 
                                hour12: true, 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm mb-1">
                              <span className="text-gray-600">Stake:</span> <span className="font-medium">{formatCurrency(bet.totalStake)}</span>
                            </div>
                            <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
                              bet.winningStatus === 20 ? 'bg-green-100 text-green-700' : 
                              bet.winningStatus === 30 ? 'bg-red-100 text-red-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {bet.winningStatus === 20 ? 'WON' : bet.winningStatus === 30 ? 'LOST' : 'PENDING'}
                            </div>
                            {bet.totalWinnings > 0 && (
                              <div className="text-sm font-medium text-green-600 mt-1">
                                Won: {formatCurrency(bet.totalWinnings)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingCalendar;