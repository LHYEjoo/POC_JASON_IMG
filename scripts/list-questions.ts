// Script to list all questions with their IDs and text
// Useful for finding which questionId corresponds to which question text

import { QUESTION_POOL_RAW } from '../src/config/suggestedQuestions';

function main() {
  console.log('📋 Alle Vragen met Question IDs\n');
  console.log('='.repeat(80));
  
  QUESTION_POOL_RAW.forEach((question, index) => {
    console.log(`\n${index + 1}. Question ID: ${question.id}`);
    console.log(`   Nederlands: ${question.text.nl}`);
    console.log(`   English: ${question.text.en}`);
    console.log(`   Tags: ${question.tags.join(', ')}`);
    console.log(`   Storage pad: preprompts/${question.id}/nl/burst-{0,1,2}.mp3`);
  });
  
  console.log(`\n\n📊 Totaal: ${QUESTION_POOL_RAW.length} vragen`);
  console.log('\n💡 Tip: Gebruik deze Question IDs bij het uploaden van audio bestanden');
  console.log('   Bijvoorbeeld: preprompts/taiwan-domestic-matter/nl/burst-0.mp3');
}

main();

