const WordSearchGenerator = () => {
  const [options, setOptions] = React.useState({
    width: 10,
    height: 10,
    font: 'Arial',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    level: ['horizontal', 'vertical']
  });
  const [wordsInput, setWordsInput] = React.useState('');
  const [wordSearch, setWordSearch] = React.useState([]);
  const [wordPositions, setWordPositions] = React.useState([]);
  const [showAnswers, setShowAnswers] = React.useState(false);

  React.useEffect(() => {
    const words = wordsInput.split('\n').filter(word => word.trim() !== '');
    if (words.length > 0) {
      const { grid, positions } = generateWordSearch(words, options);
      setWordSearch(grid);
      setWordPositions(positions);
    }
  }, [wordsInput, options]);

  const generateWordSearch = (words, options) => {
    const grid = Array(options.height).fill(null).map(() => Array(options.width).fill(''));
    const positions = [];

    const placeWord = (word, direction) => {
      const dx = direction === 'horizontal' ? 1 : direction === 'diagonal' ? 1 : 0;
      const dy = direction === 'vertical' ? 1 : direction === 'diagonal' ? 1 : 0;
      const reverse = direction.startsWith('reverse');

      for (let attempt = 0; attempt < 100; attempt++) {
        let x = Math.floor(Math.random() * options.width);
        let y = Math.floor(Math.random() * options.height);

        if (x + word.length * dx <= options.width && y + word.length * dy <= options.height) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            const char = reverse ? word[word.length - 1 - i] : word[i];
            if (grid[y + i * dy][x + i * dx] !== '' && grid[y + i * dy][x + i * dx] !== char) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              const char = reverse ? word[word.length - 1 - i] : word[i];
              grid[y + i * dy][x + i * dx] = char;
            }
            positions.push({
              word,
              start: [x, y],
              end: [x + (word.length - 1) * dx, y + (word.length - 1) * dy]
            });
            return true;
          }
        }
      }
      return false;
    };

    for (const word of words) {
      const availableDirections = options.level.flatMap(dir => 
        dir === 'reverse' ? ['reverse-horizontal', 'reverse-vertical', 'reverse-diagonal'] : dir
      );
      const direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
      placeWord(word.toUpperCase(), direction);
    }

    for (let y = 0; y < options.height; y++) {
      for (let x = 0; x < options.width; x++) {
        if (grid[y][x] === '') {
          grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    return { grid, positions };
  };

  const copyToClipboard = () => {
    const text = wordSearch.map(row => row.join(' ')).join('\n');
    navigator.clipboard.writeText(text);
  };

  const exportSVG = (includeAnswers) => {
    const cellSize = 30;
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${options.width * cellSize}" height="${options.height * cellSize}">
        <rect width="100%" height="100%" fill="${options.backgroundColor}"/>
        ${wordSearch.map((row, y) => 
          row.map((char, x) => 
            `<text x="${x * cellSize + cellSize/2}" y="${y * cellSize + cellSize/2 + 5}" font-family="${options.font}" font-size="20" fill="${options.textColor}" text-anchor="middle">${char}</text>`
          ).join('')
        ).join('')}
        ${includeAnswers ? wordPositions.map(({ start, end }) => `
          <line x1="${start[0] * cellSize + cellSize/2}" y1="${start[1] * cellSize + cellSize/2}" 
                x2="${end[0] * cellSize + cellSize/2}" y2="${end[1] * cellSize + cellSize/2}" 
                stroke="red" stroke-width="2"/>
        `).join('') : ''}
      </svg>
    `;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = includeAnswers ? 'word-search-with-answers.svg' : 'word-search.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3">
        <h2 className="text-xl font-bold mb-2">Options</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Width: {options.width}</label>
            <input
              type="range"
              min="5"
              max="20"
              value={options.width}
              onChange={(e) => setOptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Height: {options.height}</label>
            <input
              type="range"
              min="5"
              max="20"
              value={options.height}
              onChange={(e) => setOptions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Font</label>
            <select
              value={options.font}
              onChange={(e) => setOptions(prev => ({ ...prev, font: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Background Color</label>
            <input
              type="color"
              value={options.backgroundColor}
              onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Text Color</label>
            <input
              type="color"
              value={options.textColor}
              onChange={(e) => setOptions(prev => ({ ...prev, textColor: e.target.value }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Level</label>
            <select
              value={options.level.join(',')}
              onChange={(e) => setOptions(prev => ({ ...prev, level: e.target.value.split(',') }))}
              className="w-full p-2 border rounded"
            >
              <option value="horizontal,vertical">Horizontal & Vertical</option>
              
