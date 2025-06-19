import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePlayerStatsPDF = (playerName, stats, teamName, courtImage = null) => {
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);
  
  // Title Section
  doc.setFontSize(16);
  doc.text(`Player Stats Report: ${playerName}`, margin, 15);
  
  doc.setFontSize(12);
  doc.text(`Team: ${teamName}`, margin, 22);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 28);
  
  // Shot Chart Section - Full Width
  let yOffset = 35;
  if (courtImage) {
    try {
      doc.setFontSize(12);
      doc.text('Shot Chart', margin, yOffset);
      yOffset += 5;
      
      // Keep court image size
      const imageHeight = 85;
      doc.addImage(courtImage, 'PNG', margin, yOffset, contentWidth, imageHeight);
      yOffset += imageHeight + 8;
    } catch (error) {
      console.error('Error adding court image to PDF:', error);
      yOffset += 5;
    }
  }
  
  // Overall Stats Table
  doc.setFontSize(12);
  doc.text('Overall Statistics', margin, yOffset);
  
  doc.autoTable({
    startY: yOffset + 3,
    margin: { left: margin, right: margin },
    head: [['Stat', 'Value']],
    body: [
      ['Points', stats.points || 0],
      ['FG M/A', `${stats.fieldGoals.makes}/${stats.fieldGoals.total}`],
      ['FG%', `${stats.fieldGoals.percentage}%`],
      ['FT M/A', `${stats.freeThrows.makes}/${stats.freeThrows.total}`],
      ['FT%', `${stats.freeThrows.percentage}%`]
    ],
    headStyles: { fillColor: [41, 128, 185], fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 50, halign: 'center' }
    },
  });
  
  // Additional Stats Table
  yOffset = doc.autoTable.previous.finalY + 8;
  doc.setFontSize(12);
  doc.text('Additional Statistics', margin, yOffset);
  
  doc.autoTable({
    startY: yOffset + 3,
    margin: { left: margin, right: margin },
    head: [['Stat', 'Value']],
    body: [
      ['Assists', stats.assists || 0],
      ['Rebounds', stats.rebounds || 0],
      ['Steals', stats.steals || 0],
      ['Blocks', stats.blocks || 0],
      ['Turnovers', stats.turnovers || 0]
    ],
    headStyles: { fillColor: [41, 128, 185], fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 50, halign: 'center' }
    },
  });
  
  // Zone Stats Table
  yOffset = doc.autoTable.previous.finalY + 8;
  doc.setFontSize(12);
  doc.text('Zone Statistics', margin, yOffset);
  
  doc.autoTable({
    startY: yOffset + 3,
    margin: { left: margin, right: margin },
    head: [['Zone', 'Makes', 'Attempts', 'Percentage']],
    body: [
      ['Paint', stats.zones.paint.makes, stats.zones.paint.attempts, `${stats.zones.paint.percentage}%`],
      ['Mid-Range', stats.zones.midRange.makes, stats.zones.midRange.attempts, `${stats.zones.midRange.percentage}%`],
      ['3-Point', stats.zones.threePoint.makes, stats.zones.threePoint.attempts, `${stats.zones.threePoint.percentage}%`]
    ],
    headStyles: { fillColor: [41, 128, 185], fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' }
    },
  });
  
  // Save the PDF
  doc.save(`${playerName.replace(/\s+/g, '_')}_stats_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
};

export const generateBoxScorePDF = (gameData) => {
  const { homeTeam, awayTeam, homeStats, awayStats, homePlayers, awayPlayers, homePlayerStats, awayPlayerStats, homeTeamChart, awayTeamChart } = gameData;
  
  // Create new PDF document in landscape mode for better layout
  const doc = new jsPDF('landscape');
  
  // Page 1: Title and Shot Charts
  doc.setFontSize(20);
  doc.text('Game Box Score', 14, 20);
  
  doc.setFontSize(12);
  const date = new Date().toLocaleDateString();
  doc.text(`Generated on: ${date}`, 14, 30);
  
  doc.setFontSize(16);
  doc.text(homeTeam, 14, 45);
  doc.text('vs', doc.internal.pageSize.width / 2 - 5, 45);
  doc.text(awayTeam, doc.internal.pageSize.width - 14 - doc.getTextWidth(awayTeam), 45);
  
  let yOffset = 55;
  const chartWidth = 120;
  const chartHeight = 80;
  const pageWidth = doc.internal.pageSize.width;
  const spacing = (pageWidth - 28 - (chartWidth * 2)) / 3;

  if (homeTeamChart || awayTeamChart) {
    try {
      doc.setFontSize(16);
      doc.text('Team Shot Charts', 14, yOffset);
      yOffset += 10;
      
      if (homeTeamChart) {
        doc.setFontSize(12);
        doc.text(`${homeTeam} Shot Chart`, 14, yOffset);
        doc.addImage(homeTeamChart, 'PNG', 14, yOffset + 5, chartWidth, chartHeight);
      }
      
      if (awayTeamChart) {
        doc.setFontSize(12);
        doc.text(`${awayTeam} Shot Chart`, 14 + chartWidth + spacing, yOffset);
        doc.addImage(awayTeamChart, 'PNG', 14 + chartWidth + spacing, yOffset + 5, chartWidth, chartHeight);
      }
    } catch (error) {
      console.error('Error adding shot charts to PDF:', error);
    }
  }
  
  // Page 2: Team Overall Stats
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Team Statistics', 14, 20);
  
  doc.autoTable({
    startY: 30,
    head: [['Statistic', homeTeam, awayTeam]],
    body: [
      ['Total Shots', homeStats.total, awayStats.total],
      ['Makes', homeStats.makes, awayStats.makes],
      ['Misses', homeStats.misses, awayStats.misses],
      ['Overall %', `${homeStats.percentage}%`, `${awayStats.percentage}%`],
      ['Points', homeStats.points || 0, awayStats.points || 0],
      ['Field Goals M/A', `${homeStats.fieldGoals.makes}/${homeStats.fieldGoals.total}`, `${awayStats.fieldGoals.makes}/${awayStats.fieldGoals.total}`],
      ['Field Goal %', `${homeStats.fieldGoals.percentage}%`, `${awayStats.fieldGoals.percentage}%`],
      ['Free Throws M/A', `${homeStats.freeThrows.makes}/${homeStats.freeThrows.total}`, `${awayStats.freeThrows.makes}/${awayStats.freeThrows.total}`],
      ['Free Throw %', `${homeStats.freeThrows.percentage}%`, `${awayStats.freeThrows.percentage}%`],
      ['Paint M/A', `${homeStats.zones.paint.makes}/${homeStats.zones.paint.attempts}`, `${awayStats.zones.paint.makes}/${awayStats.zones.paint.attempts}`],
      ['Paint %', `${homeStats.zones.paint.percentage}%`, `${awayStats.zones.paint.percentage}%`],
      ['Mid-Range M/A', `${homeStats.zones.midRange.makes}/${homeStats.zones.midRange.attempts}`, `${awayStats.zones.midRange.makes}/${awayStats.zones.midRange.attempts}`],
      ['Mid-Range %', `${homeStats.zones.midRange.percentage}%`, `${awayStats.zones.midRange.percentage}%`],
      ['3PT M/A', `${homeStats.zones.threePoint.makes}/${homeStats.zones.threePoint.attempts}`, `${awayStats.zones.threePoint.makes}/${awayStats.zones.threePoint.attempts}`],
      ['3PT %', `${homeStats.zones.threePoint.percentage}%`, `${awayStats.zones.threePoint.percentage}%`],
      ['Assists', homeStats.assists || 0, awayStats.assists || 0],
      ['Rebounds', homeStats.rebounds || 0, awayStats.rebounds || 0],
      ['Steals', homeStats.steals || 0, awayStats.steals || 0],
      ['Blocks', homeStats.blocks || 0, awayStats.blocks || 0],
      ['Turnovers', homeStats.turnovers || 0, awayStats.turnovers || 0],
    ],
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 65, halign: 'center' },
      2: { cellWidth: 65, halign: 'center' },
    },
  });
  
  // Page 3: Player Statistics
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Player Statistics', 14, 20);
  
  // Function to create player rows
  const createPlayerRows = (players, playerStats) => {
    return players
      .filter(player => playerStats[player.id])
      .map(player => {
        const stats = playerStats[player.id];
        return [
          player.name,
          stats.points || 0,
          `${stats.fieldGoals.makes}/${stats.fieldGoals.total}`,
          `${stats.fieldGoals.percentage}%`,
          `${stats.freeThrows.makes}/${stats.freeThrows.total}`,
          `${stats.freeThrows.percentage}%`,
          stats.assists || 0,
          stats.rebounds || 0,
          stats.steals || 0,
          stats.blocks || 0,
          stats.turnovers || 0,
          `${stats.zones.paint.makes}/${stats.zones.paint.attempts}`,
          `${stats.zones.midRange.makes}/${stats.zones.midRange.attempts}`,
          `${stats.zones.threePoint.makes}/${stats.zones.threePoint.attempts}`
        ];
      });
  };
  
  // Home Team Players
  doc.autoTable({
    startY: 30,
    head: [
      [{ content: homeTeam + ' Players', colSpan: 14 }],
      ['Player', 'PTS', 'FG M/A', 'FG%', 'FT M/A', 'FT%', 'AST', 'REB', 'STL', 'BLK', 'TO', 'Paint', 'Mid', '3PT']
    ],
    body: createPlayerRows(homePlayers, homePlayerStats),
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 15, halign: 'center' },
      8: { cellWidth: 15, halign: 'center' },
      9: { cellWidth: 15, halign: 'center' },
      10: { cellWidth: 15, halign: 'center' },
      11: { cellWidth: 20, halign: 'center' },
      12: { cellWidth: 20, halign: 'center' },
      13: { cellWidth: 20, halign: 'center' }
    },
  });
  
  yOffset = doc.lastAutoTable.finalY + 20;
  
  // Away Team Players
  doc.autoTable({
    startY: yOffset,
    head: [
      [{ content: awayTeam + ' Players', colSpan: 14 }],
      ['Player', 'PTS', 'FG M/A', 'FG%', 'FT M/A', 'FT%', 'AST', 'REB', 'STL', 'BLK', 'TO', 'Paint', 'Mid', '3PT']
    ],
    body: createPlayerRows(awayPlayers, awayPlayerStats),
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 15, halign: 'center' },
      8: { cellWidth: 15, halign: 'center' },
      9: { cellWidth: 15, halign: 'center' },
      10: { cellWidth: 15, halign: 'center' },
      11: { cellWidth: 20, halign: 'center' },
      12: { cellWidth: 20, halign: 'center' },
      13: { cellWidth: 20, halign: 'center' }
    },
  });
  
  // Save the PDF
  doc.save(`box_score_${homeTeam.replace(/\s+/g, '_')}_vs_${awayTeam.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
}; 