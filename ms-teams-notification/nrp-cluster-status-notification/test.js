const batchUrl = 'https://www.google.com';
const passedCount = '1';
const failedCount = '2';
const failedNonBlockingCount = '3';
const previouslyPassedCount = '4';
const timedOutCount = '5';
const sourceEnv = 'dev';
const destEnv = 'stg';
const hasConflicts = false;
const robotResults = ['{"team": "buyfulfill", "passed": 12, "failed": 1}', '{"team": "welcome", "passed": 3, "failed": 1}'];

// Determine overall status
// Use || 0 to handle empty strings and NaN values when steps are skipped
const totalFailed = (parseInt(failedCount) || 0) + (parseInt(timedOutCount) || 0);
const totalTests = (parseInt(passedCount) || 0) + totalFailed + (parseInt(failedNonBlockingCount) || 0) + (parseInt(previouslyPassedCount) || 0);
const noTestsRan = totalTests === 0;

// Build the body items - failure header only
const bodyItems = [{
    type: "Container",
    style: "attention",
    items: [
        {
            type: "ColumnSet",
            columns: [
                {
                    type: "Column",
                    width: "auto",
                    items: [
                        {
                            type: "Image",
                            url: "https://raw.githubusercontent.com/Skitionek/notify-microsoft-teams/master/icons/failure.png",
                            size: "small"
                        }
                    ]
                },
                {
                    type: "Column",
                    width: "stretch",
                    items: [
                        {
                            type: "TextBlock",
                            text: `🚂 Release train from ${sourceEnv} to ${destEnv} failed!`,
                            weight: "bolder",
                            size: "large",
                            wrap: true
                        }
                    ]
                }
            ]
        }
    ]
}];

// Add error message or test results
if (noTestsRan) {
    bodyItems.push({
        type: "TextBlock",
        text: `ERROR: No tests ran. [Check workflow run](${runUrl})`,
        wrap: true,
        separator: true,
        color: "attention"
    });
} else {
    // Add datadog summary of test results
    datadogResult = `📊 Total: ${totalTests} \n✅ Passed: ${passedCount} \n❌ Failed: ${failedCount} \n`;
    datadogResult += `⚠️ Failed (Non-blocking): ${failedNonBlockingCount} \n ♻️ Previously Passed: ${previouslyPassedCount} \n`;
    datadogResult += `⏱️ Timed Out: ${timedOutCount}`;
    // Add Robot Tests summary of test results
    
    robotResultFactSet = [{ title: "Robot Results"}];
    for (const result of robotResults) {
        const parsedResult = JSON.parse(result);
        team = parsedResult.team;
        passed = parsedResult.passed;
        failed = parsedResult.failed;
        total = passed + failed;
        value = `📊 Total: ${total} ✅ Passed: ${passed} ❌ Failed: ${failed}`;
        team = (team === 'buyfulfill') ? 'buy' : team;
        team = (failed > 0) ? `<at>${team}</at>` : team;
        robotResultFactSet.push({ title: team, value: value});
    }

    bodyItems.push({
        type: "Container",
        separator: true,
        items: [
            {
                type: "TextBlock",
                text: "Test Summary",
                weight: "bolder",
                size: "medium"
            },
            {
                type: "FactSet",
                separator: true,
                facts: [
                    // Datadog results
                    { title: "Datadog Results", value: datadogResult }
                ]
            },
            {
                type: "FactSet",
                separator: true,
                spacing: "Large",
                // Robot results
                facts: robotResultFactSet
            }
        ]
    });
}

// Add merge conflict warning if applicable
if (hasConflicts) {
    bodyItems.push({
        type: "TextBlock",
        text: "⚠️ This PR also has **merge conflicts** and was closed. Affected services will be picked up by the next release train run.",
        wrap: true,
        separator: true,
        color: "attention"
    });
}

// Build actions array - only include Datadog link if we have a batch URL
const robotResultsUrl = 'https://www.google.com';
const actions = [];
if (batchUrl) {
    actions.push({
        type: "Action.OpenUrl",
        title: "View Synthetic Test Results",
        url: "https://www.google.com"
    });
}

actions.push({
    type: "Action.OpenUrl",
    title: "View Release Train PR",
    url: "https://www.google.com"
});

actions.push({
    type: "Action.OpenUrl",
    title: "Github Action Run",
    url: "https://www.google.com"
});

if (robotResultsUrl && robotResultsUrl !== "") {
    actions.push({
        type: "Action.OpenUrl",
        title: `View Robot Results`,
        url: "https://www.google.com"
    });
}

const msteamsTagBuy = 'asdf';
const msteamsTagMac = 'asdf';
const msteamsTagQA = 'asdf';
const msteamsTagWelcome = 'asdf';

// Build the complete card
const card = {
    type: "message",
    attachments: [
        {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                type: "AdaptiveCard",
                version: "1.4",
                body: bodyItems,
                actions: actions,
                msteams: {
                    entities: [
                        {
                            type: "mention",
                            text: "<at>buy</at>",
                            mentioned: {
                                id: msteamsTagBuy,
                                name: "buy",
                                type: "tag"
                            }
                        },
                        {
                            type: "mention",
                            text: "<at>mac</at>",
                            mentioned: {
                                id: msteamsTagMac,
                                name: "mac",
                                type: "tag"
                            }
                        },
                        {
                            type: "mention",
                            text: "<at>qa</at>",
                            mentioned: {
                                id: msteamsTagQA,
                                name: "qa",
                                type: "tag"
                            }
                        },
                        {
                            type: "mention",
                            text: "<at>welcome</at>",
                            mentioned: {
                                id: msteamsTagWelcome,
                                name: "welcome",
                                type: "tag"
                            }
                        }
                    ]
                }
            }
        }
    ]
};

// Output the card as a JSON string
console.log(JSON.stringify(card));

const fs = require('fs');
fs.writeFileSync('ms-teams-notification/nrp-cluster-status-notification/result.json', JSON.stringify(card));

// core.setOutput('card_payload', JSON.stringify(card));