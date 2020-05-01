const alphabet = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];

const insertAlphabetHelper = async (tree, tillCharacter) => {
  const nodes = {};

  let i = 0;

  while (alphabet[i] <= tillCharacter) {
    await tree.insert(alphabet[i], alphabet[i]);

    // Creating a copy of the keys and relations,
    // to  have the exact data on that point
    nodes[alphabet[i]] = {
      node: tree.mostRightIndexNode,
      nodeNumber: tree.mostRightIndexNode.nodeNumber,
      keys: [...tree.mostRightIndexNode.keys],
      relations: [...tree.mostRightIndexNode.relations],
    };

    i++;
  }

  return nodes;
};

export default insertAlphabetHelper;
