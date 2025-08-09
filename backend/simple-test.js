console.log('=== TEST SECTIONS PARSING ===');

// Test case: Array of JSON strings (như trong log của user)
const testCase = [
  "{\"title\":\"Thu test form thêm khóa học nhé (9/8)\",\"lessons\":[{\"title\":\"Thu test form thêm khóa học nhé (9/8)\",\"video\":{\"file\":{\"uid\":\"rc-upload-1754728695133-5\"},\"duration\":0},\"quiz\":{\"questions\":[{\"question\":\"Thu test form thêm khóa học nhé (9/8)\",\"options\":[\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\"],\"correctIndex\":0},{\"question\":\"Thu test form thêm khóa học nhé (9/8)\",\"options\":[\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\"],\"correctIndex\":2}]}}]}",
  "{\"title\":\"Thu test form thêm khóa học nhé (9/8)\",\"lessons\":[{\"title\":\"Thu test form thêm khóa học nhé (9/8)\",\"video\":{\"file\":{\"uid\":\"rc-upload-1754728695133-8\"},\"duration\":0},\"quiz\":{\"questions\":[{\"question\":\"Thu test form thêm khóa học nhé (9/8)\",\"options\":[\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\",\"Thu test form thêm khóa học nhé (9/8)\"],\"correctIndex\":0}]}}]}"
];

console.log('Input:', JSON.stringify(testCase, null, 2));

// Simulate the new parsing logic
let sectionsData = testCase;

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

console.log('\n✅ Test PASSED - Array of JSON strings parsed correctly'); 