import React, {useState, useEffect} from 'react';
import { ENGLISH_BIP39_WORDS } from '../const/const';

function generateEntropy(nbWords) {
  const wordLength_bit = 32;
  const entropyLength_bit = wordLength_bit * nbWords;
  let entropy = new Uint8Array(entropyLength_bit/8);
  window.crypto.getRandomValues(entropy);
  return entropy;
}


function getChecksumFirstNthBits(checksum, nbWords) {
  console.log("HELLO ?")
  console.log("checksum ?", checksum)
  let nbOfBytes = Math.floor(nbWords/8);
  let nbOfRemainingBits = nbWords % 8;
  if ( nbOfRemainingBits !== 0 ) {
    nbOfBytes++;
  }
  let firstBitsChecksum = new Uint8Array(nbOfBytes); 
  for (let i = 0; i < nbOfBytes; i++) {
    console.log("cheksum[i]", checksum[i]);
    firstBitsChecksum[i] = checksum[i];
  }
  if ( nbOfRemainingBits !== 0 ) {
    let shift = 8 - nbOfRemainingBits;
    firstBitsChecksum[nbOfBytes - 1] =  (firstBitsChecksum[nbOfBytes - 1] >> shift) << shift;
  }
  return firstBitsChecksum;
}


function getChecksum(entropy) {
  return window.crypto.subtle.digest("SHA-256", entropy);
}

async function entropyWithPartialChecksum(nbWords) {
  const entropy = generateEntropy(nbWords);
  console.log("partial entropy", entropy);
  const checksum = new Uint8Array(await getChecksum(entropy));
  console.log("checksum", checksum);
  const partialChecksum = getChecksumFirstNthBits(checksum, nbWords);
  console.log("partial checksum ", partialChecksum);
  return new Uint16Array([...entropy, ...partialChecksum]);
}
 
function getWordIndexFromEntropy(entropyWithCheksum) {
  let indices = [];
  let consumedBits = 0;
  for ( let i = 0; i < entropyWithCheksum.length; i++ ) {
    let arrPos = Math.floor(consumedBits/16);
    let positionIn2B = consumedBits%16;
    let num = 0;
    console.log("arrPos", arrPos);
    if (positionIn2B < 6 ) { // 11 bits fully in 16 bits at index arrPos
      let bitRemainingAfter = 16 - (11 + positionIn2B);
      console.log("entropyWithCheksum[arrPos]",entropyWithCheksum[arrPos]);
      num = (entropyWithCheksum[arrPos] >> bitRemainingAfter) & 0b11111111111;
    } else {
      // [positionIn2B][11 bits: [16-positionIn2B][11-(16-positionIn2B)]][bitRemaingAfter]
      console.log("entropyWithCheksum[arrPos]",entropyWithCheksum[arrPos]);
      console.log("entropyWithCheksum[arrPos+1]",entropyWithCheksum[arrPos+1]);
      let num32bits = entropyWithCheksum[arrPos] << 16 + entropyWithCheksum[arrPos + 1];
      let bitRemainingAfter = 16 - (11 - (16 - positionIn2B));
      num = (num32bits >> bitRemainingAfter) & 0b11111111111;
    }
    indices.push(num);
    consumedBits += 11;
  }
  console.log(indices);
  return indices;
}

async function doStuff() {
  let entropy = await entropyWithPartialChecksum(8);
  console.log("full entropy ", entropy)
  const indices = getWordIndexFromEntropy(entropy);
  console.log("indices ", indices);
  let wordsList = [];
  for (let i of indices) {
    console.log(i);
    console.log(ENGLISH_BIP39_WORDS[i]);
    wordsList.push(ENGLISH_BIP39_WORDS[i]);
  }
  console.log(wordsList);
}

export function SeedPhraseGenerator() {
  const [entropy, setEntropy] = useState(null);
  const [checksum, setChecksum] = useState(null);
  const generateEntropy = async () => {
    const entropy = generateEntropy();
    setEntropy(entropy);
    const checksumFull = await
    console.log(checksumFull)
    const usefulChecksumBits = (new Uint8Array(checksumFull));
    setChecksum(usefulChecksumBits);

  }

  doStuff();
  const toBinString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(2).padStart(8, '0'), '');

  return (
    <>
      Entropy: { entropy && toBinString(entropy)}
      Checksum: {checksum && toBinString(checksum)}
      <button onClick={generateEntropy}>Generate entropy</button>
    </>
  );
}