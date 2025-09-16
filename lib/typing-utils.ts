export function getRandomTypingPhrase(translation: (key: string) => string): string {
  
  const typingKeys = [
    'typing_1',
    'typing_2', 
    'typing_3',
    'typing_4',
    'typing_5',
    'typing_6',
    'typing_7',
    'typing_8',
    'typing_9',
    'typing_10',
    'typing_11',
    'typing_12',
    'typing_13',
    'typing_14'
  ];

  
  const randomIndex = Math.floor(Math.random() * typingKeys.length);
  const randomKey = typingKeys[randomIndex];
  
  
  return translation(randomKey);
}