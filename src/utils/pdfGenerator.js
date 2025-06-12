import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePlayerStatsPDF = (playerName, stats, teamName) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(`Player Stats Report: ${playerName}`, 14, 20);
  
  // Add team name
  doc.setFontSize(14);
  doc.text(`Team: ${teamName}`, 14, 30);
  
  // Add date
  doc.setFontSize(12);
  const date = new Date().toLocaleDateString();
  doc.text(`Generated on: ${date}`, 14, 40);
  
  // Overall Stats Table
  doc.autoTable({
    startY: 50,
    head: [['Overall Statistics', 'Value']],
    body: [
      ['Total Shots', stats.total],
      ['Makes', stats.makes],
      ['Misses', stats.misses],
      ['Overall %', `${stats.percentage}%`],
      ['Field Goals M/A', `${stats.fieldGoals.makes}/${stats.fieldGoals.total}`],
      ['Field Goal %', `${stats.fieldGoals.percentage}%`],
      ['Free Throws M/A', `${stats.freeThrows.makes}/${stats.freeThrows.total}`],
      ['Free Throw %', `${stats.freeThrows.percentage}%`],
    ],
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  let yOffset = doc.lastAutoTable.finalY + 15;
  
  // Add Zone Statistics title
  doc.setFontSize(16);
  doc.text('Zone Statistics', 14, yOffset);
  yOffset += 10;
  
  // Zone Stats Tables
  const zoneStats = [
    {
      title: 'Paint',
      stats: stats.zones.paint,
    },
    {
      title: 'Mid-Range',
      stats: stats.zones.midRange,
    },
    {
      title: '3-Point',
      stats: stats.zones.threePoint,
    },
  ];
  
  zoneStats.forEach((zone) => {
    doc.autoTable({
      startY: yOffset,
      head: [[`${zone.title} Statistics`, 'Value']],
      body: [
        ['Makes', zone.stats.makes],
        ['Attempts', zone.stats.attempts],
        ['Percentage', `${zone.stats.percentage}%`],
      ],
      headStyles: { fillColor: [41, 128, 185] },
    });
    yOffset = doc.lastAutoTable.finalY + 10;
  });
  
  // Save the PDF
  doc.save(`${playerName.replace(/\s+/g, '_')}_stats_${date.replace(/\//g, '-')}.pdf`);
};

export const generateBoxScorePDF = (gameData) => {
  const { homeTeam, awayTeam, homeStats, awayStats, homePlayers, awayPlayers, homePlayerStats, awayPlayerStats } = gameData;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Game Box Score', 14, 20);
  
  // Add date
  doc.setFontSize(12);
  const date = new Date().toLocaleDateString();
  doc.text(`Generated on: ${date}`, 14, 30);
  
  // Add team names as header
  doc.setFontSize(16);
  doc.text(homeTeam, 14, 45);
  doc.text('vs', doc.internal.pageSize.width / 2 - 5, 45);
  doc.text(awayTeam, doc.internal.pageSize.width - 14 - doc.getTextWidth(awayTeam), 45);
  
  // Team Overall Stats Table
  doc.autoTable({
    startY: 55,
    head: [['Statistic', homeTeam, awayTeam]],
    body: [
      ['Total Shots', homeStats.total, awayStats.total],
      ['Makes', homeStats.makes, awayStats.makes],
      ['Misses', homeStats.misses, awayStats.misses],
      ['Overall %', `${homeStats.percentage}%`, `${awayStats.percentage}%`],
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
    ],
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 65, halign: 'center' },
      2: { cellWidth: 65, halign: 'center' },
    },
  });
  
  let yOffset = doc.lastAutoTable.finalY + 15;
  
  // Player Statistics
  doc.setFontSize(16);
  doc.text('Player Statistics', 14, yOffset);
  yOffset += 10;
  
  // Function to create player rows
  const createPlayerRows = (players, playerStats) => {
    return players
      .filter(player => playerStats[player.id])
      .map(player => {
        const stats = playerStats[player.id];
        return [
          player.name,
          stats.total,
          `${stats.fieldGoals.makes}/${stats.fieldGoals.total}`,
          `${stats.fieldGoals.percentage}%`,
          `${stats.freeThrows.makes}/${stats.freeThrows.total}`,
          `${stats.freeThrows.percentage}%`,
          `${stats.zones.paint.makes}/${stats.zones.paint.attempts}`,
          `${stats.zones.midRange.makes}/${stats.zones.midRange.attempts}`,
          `${stats.zones.threePoint.makes}/${stats.zones.threePoint.attempts}`,
        ];
      });
  };
  
  // Home Team Players
  doc.autoTable({
    startY: yOffset,
    head: [
      [{ content: homeTeam + ' Players', colSpan: 9 }],
      ['Player', 'Total', 'FG M/A', 'FG%', 'FT M/A', 'FT%', 'Paint', 'Mid', '3PT']
    ],
    body: createPlayerRows(homePlayers, homePlayerStats),
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 18, halign: 'center' },
    },
  });
  
  yOffset = doc.lastAutoTable.finalY + 10;
  
  // Away Team Players
  doc.autoTable({
    startY: yOffset,
    head: [
      [{ content: awayTeam + ' Players', colSpan: 9 }],
      ['Player', 'Total', 'FG M/A', 'FG%', 'FT M/A', 'FT%', 'Paint', 'Mid', '3PT']
    ],
    body: createPlayerRows(awayPlayers, awayPlayerStats),
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 18, halign: 'center' },
    },
  });
  
  // Save the PDF
  doc.save(`box_score_${homeTeam.replace(/\s+/g, '_')}_vs_${awayTeam.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
}; 