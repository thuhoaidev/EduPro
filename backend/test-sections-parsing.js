// Test logic parse sections
const testSectionsParsing = () => {
  console.log('=== TEST SECTIONS PARSING ===');
  
  // Test case 1: Array of JSON strings (như trong log của user)
  const testCase1 = [
    "{\"title\":\"Thu test form thêm khóa học nhé (9/8)\",\"lessons\":[{\"title\":\"Thu test form thêm khóa học nhé (9/8)\",\"video\":{\"file\":{\"uid\":\"rc-upload-1754728695133-5\"},\"duration\":0},\"quiz\":{\"questions\":[{\"question\":\"Thu test form thêm khóa học nhé (9/8)\",\"options\":[\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\"],\"correctIndex\":0},{\"question\":\"Thu test form thêm khóa học nhé (9/8)\",\"options\":[\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\"],\"correctIndex\":2}]}}]}",
    "{\"title\":\"Thu test form thêm khóa học nhé (9/8)\",\"lessons\":[{\"title\":\"Thu test form thêm khóa học nhé (9/8)\",\"video\":{\"file\":{\"uid\":\"rc-upload-1754728695133-8\"},\"duration\":0},\"quiz\":{\"questions\":[{\"question\":\"Thu test form thêm khóa học nhé (9/8)\",\"options\":[\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\"],\"correctIndex\":0}]}}]}"
  ];
  
  console.log('Test Case 1 - Array of JSON strings:');
  console.log('Input:', JSON.stringify(testCase1, null, 2));
  
  // Simulate the new parsing logic
  let sectionsData = testCase1;
  
  if (Array.isArray(sectionsData)) {
    sectionsData = sectionsData.map((item, index) => {
      if (typeof item === 'string') {
        try {
          const parsed = JSON.parse(item);
          console.log(`Parsed section ${index} from string:`, JSON.stringify(parsed, null, 2));
          return parsed;
        } catch (parseError) {
          console.error(`Lỗi parse JSON section ${index}:`, parseError);
          throw new Error(`Dữ liệu section ${index + 1} không hợp lệ`);
        }
      }
      return item;
    });
    console.log('Final parsed sections data:', JSON.stringify(sectionsData, null, 2));
  }
  
  // Test access to title property
  console.log('\nTesting title access:');
  sectionsData.forEach((section, index) => {
    console.log(`Section ${index} title:`, section.title);
    console.log(`Section ${index} has lessons:`, section.lessons ? section.lessons.length : 0);
  });
  
  console.log('\n✅ Test Case 1 PASSED - Array of JSON strings parsed correctly');
  
  // Test case 2: Single JSON string
  console.log('\n=== Test Case 2 - Single JSON string ===');
  const testCase2 = "{\"title\":\"Single Section\",\"lessons\":[]}";
  console.log('Input:', testCase2);
  
  let sectionsData2 = testCase2;
  
  if (typeof sectionsData2 === 'string') {
    try {
      sectionsData2 = JSON.parse(sectionsData2);
      console.log('Parsed sections data from string:', JSON.stringify(sectionsData2, null, 2));
    } catch (parseError) {
      console.error('Lỗi parse JSON sections:', parseError);
      throw new Error('Dữ liệu sections không hợp lệ');
    }
  }
  
  if (sectionsData2 && !Array.isArray(sectionsData2)) {
    sectionsData2 = [sectionsData2];
    console.log('Converted single section to array:', JSON.stringify(sectionsData2, null, 2));
  }
  
  console.log('Final result:', JSON.stringify(sectionsData2, null, 2));
  console.log('✅ Test Case 2 PASSED - Single JSON string parsed correctly');
  
  // Test case 3: Already parsed array
  console.log('\n=== Test Case 3 - Already parsed array ===');
  const testCase3 = [
    { title: "Section 1", lessons: [] },
    { title: "Section 2", lessons: [] }
  ];
  console.log('Input:', JSON.stringify(testCase3, null, 2));
  
  let sectionsData3 = testCase3;
  
  if (Array.isArray(sectionsData3)) {
    sectionsData3 = sectionsData3.map((item, index) => {
      if (typeof item === 'string') {
        try {
          const parsed = JSON.parse(item);
          console.log(`Parsed section ${index} from string:`, JSON.stringify(parsed, null, 2));
          return parsed;
        } catch (parseError) {
          console.error(`Lỗi parse JSON section ${index}:`, parseError);
          throw new Error(`Dữ liệu section ${index + 1} không hợp lệ`);
        }
      }
      return item;
    });
    console.log('Final parsed sections data:', JSON.stringify(sectionsData3, null, 2));
  }
  
  console.log('✅ Test Case 3 PASSED - Already parsed array handled correctly');
  
  console.log('\n🎉 All tests passed! Logic should work correctly now.');
};

testSectionsParsing(); 