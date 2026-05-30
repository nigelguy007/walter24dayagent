// ═══════════════════════════════════════════
// Kirkland Campaign HQ — Google Apps Script
// Deploy at script.google.com as a web app
// Required: Enable Drive API under Services (+)
// ═══════════════════════════════════════════

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  try {
    var body = JSON.parse(e.postData.contents);
    var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_KEY');
    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      payload: JSON.stringify({
        model: body.model || 'claude-sonnet-4-20250514',
        max_tokens: body.max_tokens || 1500,
        system: body.system,
        messages: body.messages
      }),
      muteHttpExceptions: true
    });
    output.setContent(response.getContentText());
  } catch(err) {
    output.setContent(JSON.stringify({ error: { message: err.message } }));
  }
  return output;
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'driveContent') {
    return getDriveContent();
  }
  return ContentService.createTextOutput('Kirkland Campaign Proxy is live');
}

function getDriveContent() {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  try {
    var folderId = '139qhMjkIPBqb16i4HVBem8n6y5phgTYl'; // UPDATE for new campaign
    var folder = DriveApp.getFolderById(folderId);
    var result = readFolder(folder);
    output.setContent(JSON.stringify({ files: result, synced: new Date().toISOString() }));
  } catch(err) {
    output.setContent(JSON.stringify({ error: err.message, files: [] }));
  }
  return output;
}

function readFolder(folder) {
  var result = [];
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    var mime = file.getMimeType();
    var name = file.getName();
    try {
      if (mime === 'application/vnd.google-apps.shortcut') {
        // Follow shortcuts — requires Drive API enabled under Services
        var meta = Drive.Files.get(file.getId(), { fields: 'shortcutDetails' });
        if (meta.shortcutDetails && meta.shortcutDetails.targetMimeType === 'application/vnd.google-apps.folder') {
          var targetFolder = DriveApp.getFolderById(meta.shortcutDetails.targetId);
          result = result.concat(readFolder(targetFolder));
        }
      } else if (mime.indexOf('image/') === 0) {
        result.push({ name: name, content: '[CAMPAIGN PHOTO: ' + name + ' — URL: ' + file.getUrl() + ']', type: 'image' });
      } else if (mime === 'application/vnd.google-apps.document') {
        result.push({ name: name, content: DocumentApp.openById(file.getId()).getBody().getText(), type: 'document' });
      } else if (mime.indexOf('text/') === 0) {
        result.push({ name: name, content: file.getBlob().getDataAsString().substring(0, 5000), type: 'text' });
      }
    } catch(fe) {
      result.push({ name: name, content: '[Could not read: ' + fe.message + ']', type: mime });
    }
  }
  // Recurse into subfolders
  var subs = folder.getFolders();
  while (subs.hasNext()) {
    result = result.concat(readFolder(subs.next()));
  }
  return result;
}
