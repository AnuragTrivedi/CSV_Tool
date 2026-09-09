export const SAMPLE_CSV_CONTENT = `isbn,rowType,sequence,name,groupName,url,actionEnabled,allowTo,isAllowToDemo,Book Type,isMainPdf,openInMainContent,isVisibleInPageButton,pageNo,recordType,isConvertToTopic,isRemove
9.78937E+12,book_assets,1,Flipbook With Assets,Flipbook With Assets,book/flipbooks/Teacher/MathsWiz2026/Class8_Part2/index.html,VIEW,BOTH,FALSE,,FALSE,FALSE,FALSE,,OLD,FALSE,FALSE
,chapter,8,Fractions in Disguise,,,,,FALSE,,FALSE,FALSE,FALSE,,OLD,FALSE,FALSE
,chapter_assets,1,Course Book,Pdf File ,uploads/G1wxPcFsZ4gyDFDEf_wftA/86f5de80-2932-4e48-8bcd-d41ee36cd28c.pdf,VIEW,BOTH,FALSE,Coursebook,TRUE,TRUE,FALSE,,OLD,FALSE,FALSE
,chapter_assets,2,Animation -1,Animation,uploads/DZiDoqoISRahkHroTRmumg/2f44e699-e1cc-40dd-810a-d6a59aead817.mp4,VIEW,BOTH,FALSE,Coursebook,FALSE,FALSE,TRUE,"1,2",OLD,FALSE,FALSE
,chapter_assets,3,Animation -2,Animation,uploads/QKWgkpWgd005JLmtzdCQnA/487a346c-b10a-4405-8fd9-2d74a22c39d4.mp4,VIEW,BOTH,FALSE,Coursebook,FALSE,FALSE,TRUE,"1,2",OLD,FALSE,FALSE
,chapter_assets,4,Animation -3,Animation,uploads/j3MwlXNwGp1SW0k4YoO8ow/90a244e2-c5ce-4c74-9e27-e214fd75a441.mp4,VIEW,BOTH,FALSE,Coursebook,FALSE,FALSE,TRUE,"1,2",OLD,FALSE,FALSE
,chapter,9,The Baudhayana-Pythagoras Theorem,,,,,FALSE,,FALSE,FALSE,FALSE,,OLD,FALSE,FALSE
,chapter,10,Proportional Reasoning - 2,,,,,FALSE,,FALSE,FALSE,FALSE,,OLD,FALSE,FALSE
,chapter,11,Exploring Some Geometric Themes,,,,,FALSE,,FALSE,FALSE,FALSE,,OLD,FALSE,FALSE
,chapter,12,Tales by Dots and Lines,,,,,FALSE,,FALSE,FALSE,FALSE,,OLD,FALSE,FALSE
,chapter,13,Algebra Play,,,,,FALSE,,FALSE,FALSE,FALSE,,OLD,FALSE,FALSE
,chapter,14,Area,,,,,FALSE,,FALSE,FALSE,FALSE,,OLD,FALSE,FALSE`;

export const SAMPLE_ASSET_FILES = [
  // Chapter 8 (already has Animations 1-3, but here is an additional animation and an interactivity)
  'MathsWiz2026_Class8_Part2_CH08_VID04.mp4',
  'MathsWiz2026_Class8_Part2_CH08_AC_01.zip',
  // Chapter 9 (currently empty in the CSV)
  'MathsWiz2026_Class8_Part2_CH09_CB_01.pdf',
  'MathsWiz2026_Class8_Part2_CH09_VID01.mp4',
  'MathsWiz2026_Class8_Part2_CH09_VID02.mp4',
  'MathsWiz2026_Class8_Part2_CH09_TM_01.pdf',
  'MathsWiz2026_Class8_Part2_CH09_WS_01.pdf',
  'MathsWiz2026_Class8_Part2_CH09_AC_01.zip',
  // Chapter 10
  'MathsWiz2026_Class8_Part2_CH10_CB_01.pdf',
  'MathsWiz2026_Class8_Part2_CH10_VID01.mp4',
  'MathsWiz2026_Class8_Part2_CH10_WS_01.pdf',
  // Chapter 11
  'MathsWiz2026_Class8_Part2_CH11_CB_01.pdf',
  'MathsWiz2026_Class8_Part2_CH11_VID01.mp4',
  // Diagnostic test samples:
  'ReadMe_Instructions.txt', // Will trigger unmatched pattern note
  'MathsWiz2026_Class8_Part2_CH99_VID01.mp4', // Will trigger chapter 99 not in CSV warning
];
