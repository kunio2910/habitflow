const SHEET_NAME = 'Storage';

function doGet(e) {
  try {
    const userId = e && e.parameter && e.parameter.userId
      ? e.parameter.userId
      : 'default';
    const sheet = getStorageSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      return createJsonResponse({
        success: true,
        data: null,
        message: 'Chưa có dữ liệu'
      });
    }

    const rows = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const matchingRow = rows.find(function (row) {
      return String(row[0]) === String(userId);
    });

    return createJsonResponse({
      success: true,
      data: matchingRow ? JSON.parse(matchingRow[1]) : null,
      updatedAt: matchingRow ? matchingRow[2] : null
    });
  } catch (error) {
    return createJsonResponse({ success: false, message: error.message });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Không nhận được dữ liệu từ ứng dụng');
    }

    const request = JSON.parse(e.postData.contents);
    const userId = request.userId || 'default';
    const data = request.data;

    if (!data || typeof data !== 'object') {
      throw new Error('Dữ liệu gửi lên không hợp lệ');
    }

    const sheet = getStorageSheet();
    const jsonText = JSON.stringify(data);
    const now = new Date();
    const lastRow = sheet.getLastRow();
    let matchingSheetRow = -1;

    if (lastRow >= 2) {
      const userIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      const matchingIndex = userIds.findIndex(function (row) {
        return String(row[0]) === String(userId);
      });
      if (matchingIndex >= 0) matchingSheetRow = matchingIndex + 2;
    }

    if (matchingSheetRow >= 2) {
      sheet.getRange(matchingSheetRow, 1, 1, 3)
        .setValues([[userId, jsonText, now]]);
    } else {
      sheet.appendRow([userId, jsonText, now]);
    }

    return createJsonResponse({
      success: true,
      message: 'Đã lưu dữ liệu thành công',
      userId: userId,
      updatedAt: now
    });
  } catch (error) {
    return createJsonResponse({ success: false, message: error.message });
  }
}

function getStorageSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Không tìm thấy trang tính "' + SHEET_NAME + '"');
  }
  return sheet;
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function testConnection() {
  Logger.log('Kết nối thành công với trang tính: ' + getStorageSheet().getName());
}
