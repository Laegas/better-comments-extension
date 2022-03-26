let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);

  // getCurrentTab()
  
});

// async function getCurrentTab() {
//   let queryOptions = { active: true, currentWindow: true };
//   let [tab] = await chrome.tabs.query(queryOptions);
//   console.log(tab)
// }

// chrome.tabs.query({active: true, currentWindow: true}, tabs => {
//   let url = tabs[0].url;
//   // use `url` here inside the callback because it's asynchronous!
// });

// chrome.action - change icon to one with green check mark when on GitHub or when actually doing something on GitHub
// chrome.alarms - schedule code? the syntax highlighter might need to run every few seconds when new things are shown / hidden
// chrome.declarativeContent - take actions depending on the content without reading it?
// chrome.events - notification when something happens - maybe could be used instead of scheduling?

// Idea for April Fool's Day - redirect from Ledgy to Capdesk, show notification / popup "Seems like you've got lost"
// chrome.notification