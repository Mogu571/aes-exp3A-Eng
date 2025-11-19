// -------------------------- 实验流程（Timeline） --------------------------
// 使用函数构建timeline，确保所有插件已加载

// 简化的数据下载功能 - 只支持TXT格式
function downloadData(dataText, fileName) {
    try {
        // 方法1：尝试使用 FileSaver.js (如果可用)
        if (typeof saveAs !== 'undefined') {
            const blob = new Blob([dataText], { type: "text/plain; charset=utf-8" });
            saveAs(blob, fileName);
            console.log("使用 FileSaver.js 下载成功");
            return true;
        }
    } catch (error) {
        console.warn("FileSaver.js 下载失败，尝试原生方法:", error);
    }
    
    try {
        // 方法2：使用原生浏览器下载
        const blob = new Blob([dataText], { type: "text/plain; charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("使用原生方法下载成功");
        return true;
    } catch (error) {
        console.warn("原生下载失败，尝试备用方法:", error);
    }
    
    try {
        // 方法3：使用 data URI 下载
        const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataText);
        const a = document.createElement('a');
        a.href = dataUri;
        a.download = fileName;
        a.click();
        console.log("使用 data URI 下载成功");
        return true;
    } catch (error) {
        console.error("所有下载方法都失败:", error);
    }
    
    // 方法4：最后的备用方案 - 显示数据让用户复制
    showDataForCopy(dataText, fileName);
    return false;
}

// 显示数据供用户复制的备用方案
function showDataForCopy(dataText, fileName) {
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (newWindow) {
        newWindow.document.write(`
            <html>
                <head>
                    <title>Experimental Data - ${fileName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        textarea { width: 100%; height: 70%; font-family: monospace; }
                        .copy-btn { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px 5px; }
                        .copy-btn:hover { background: #005a8b; }
                    </style>
                </head>
                <body>
                    <h2>Experimental Data (${fileName})</h2>
                    <p>Due to automatic download failure, please manually copy the following data and save as TXT file:</p>
                    <button class="copy-btn" onclick="copyToClipboard()">Copy Data</button>
                    <button class="copy-btn" onclick="selectAll()">Select All</button>
                    <br>
                    <textarea id="dataText" readonly>${dataText}</textarea>
                    <script>
                        function copyToClipboard() {
                            const textarea = document.getElementById('dataText');
                            textarea.select();
                            document.execCommand('copy');
                            alert('Data copied to clipboard!');
                        }
                        function selectAll() {
                            document.getElementById('dataText').select();
                        }
                    </script>
                </body>
            </html>
        `);
        console.log("Data displayed in new window for copying");
    } else {
        // 如果无法打开新窗口，在当前页面显示
        alert(`Download failed! Please manually copy the following data and save as TXT file:\n\n${dataText.substring(0, 500)}...\n\nComplete data can be found in console.`);
        console.log("Complete experimental data:", dataText);
    }
}

// 保存数据到本地存储作为备份
function saveBackupData() {
    try {
        const backupData = {
            subjectName: GLOBAL_DATA.subjectName,
            subjectGender: GLOBAL_DATA.subjectGender,
            experimentLog: GLOBAL_DATA.experimentLog,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('experiment_backup', JSON.stringify(backupData));
    } catch (error) {
        console.warn("本地备份失败:", error);
    }
}

// 检查并恢复备份数据
function checkBackupData() {
    try {
        const backup = localStorage.getItem('experiment_backup');
        if (backup) {
            const backupData = JSON.parse(backup);
            const timeDiff = new Date() - new Date(backupData.timestamp);
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            if (hoursDiff < 24) { // 24小时内的备份
                const trialCount = backupData.experimentLog.length - 1;
                if (confirm(`Found experimental data backup from ${new Date(backupData.timestamp).toLocaleString()} (${trialCount} trials). Download now?`)) {
                    const dataText = backupData.experimentLog.join("\n");
                    const fileName = `${backupData.subjectName}_BackupData_${backupData.timestamp.slice(0,10)}.txt`;
                    downloadData(dataText, fileName);
                    localStorage.removeItem('experiment_backup');
                }
            }
        }
    } catch (error) {
        console.warn("检查备份数据失败:", error);
    }
}

function buildTimeline() {
    // 页面加载时检查备份数据
    setTimeout(checkBackupData, 1000);
    
    const timeline = [];

    // -------------------------- 环节1：被试姓名和性别录入 --------------------------
    const nameTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <div class="welcome-container">
                <h2>Welcome to participate in the experiment!</h2>
                <div style="margin-top: 50px;">
                    <p style="font-size: 18px; margin-bottom: 15px;">Please enter your name:</p>
                    <input type="text" id="subject-name" placeholder="e.g., John Smith" style="padding: 8px 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 5px; width: 200px;">
                </div>
                <div style="margin-top: 30px;">
                    <p style="font-size: 18px; margin-bottom: 15px;">Please select your gender:</p>
                    <div style="display: flex; justify-content: center; gap: 30px;">
                        <label style="display: flex; align-items: center; cursor: pointer; font-size: 16px;">
                            <input type="radio" name="gender" value="Male" style="margin-right: 8px; transform: scale(1.2);">
                            Male
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; font-size: 16px;">
                            <input type="radio" name="gender" value="Female" style="margin-right: 8px; transform: scale(1.2);">
                            Female
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; font-size: 16px;">
                            <input type="radio" name="gender" value="Prefer not to say" style="margin-right: 8px; transform: scale(1.2);">
                            Prefer not to say
                        </label>
                    </div>
                </div>
                <p style="margin-top: 40px; font-size: 16px; color: #6c757d;">Press the <kbd>Spacebar</kbd> to continue after entering your information.</p>
            </div>
        `,
        choices: [" "],
        on_load: () => {
            document.body.style.backgroundColor = "#f8f9fa"; // 白色背景
            const nameInput = document.getElementById("subject-name");
            nameInput.addEventListener("input", (e) => {
                GLOBAL_DATA.subjectName = e.target.value.trim();
            });
            
            // 添加性别选择监听
            const genderInputs = document.querySelectorAll('input[name="gender"]');
            genderInputs.forEach(input => {
                input.addEventListener("change", (e) => {
                    GLOBAL_DATA.subjectGender = e.target.value;
                });
            });
        },
        on_finish: () => {
            if (!GLOBAL_DATA.subjectName) {
                GLOBAL_DATA.subjectName = `Anonymous_${new Date().getTime()}`;
            }
            if (!GLOBAL_DATA.subjectGender) {
                GLOBAL_DATA.subjectGender = "Not selected";
            }
            // 修正：将姓名和性别信息保存到第一行
            GLOBAL_DATA.experimentLog[0] = `Subject Name: ${GLOBAL_DATA.subjectName}\tGender: ${GLOBAL_DATA.subjectGender}`;
            saveBackupData();
        }
    };
    timeline.push(nameTrial);

    // -------------------------- 环节2：实验指导语 --------------------------
    const instructionTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <div style="text-align: center; margin-top: 60px;">
                <img src="instruction.png" style="max-width: 900px; width: 100%; height: auto; border-radius: 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                <p style="margin-top: 32px; font-size: 18px; color: #007cba;">Press the <kbd>Spacebar</kbd> to start the experiment.</p>
            </div>
        `,
        choices: [" "],
        post_trial_gap: 500,
        on_load: () => {
             document.body.style.backgroundColor = "#f8f9fa"; // 白色背景
        }
    };
    timeline.push(instructionTrial);

    //  添加过渡试次，切换到实验背景色
    const startExperimentTransition = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <div style="text-align: center; margin-top: 200px; color: #ffffff;">
                <h2 style="font-size: 24px; color: #ffffff;">The experiment is about to start</h2>
                <p style="margin-top: 20px; font-size: 18px; color: #e5e7eb;">Please stay focused</p>
            </div>
        `,
        choices: "NO_KEYS",
        trial_duration: 1500,
        on_load: () => {
            document.body.style.backgroundColor = "#626262"; //
        }
    };
    timeline.push(startExperimentTransition);

    // -------------------------- 环节3：60个实验试次（循环生成） --------------------------
    for (let i = 0; i < IMAGE_LIST.length; i++) {
        const currentImage = IMAGE_LIST[i];

        // 子环节1：注视点（1s）
        const fixationTrial = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `<div class="fixation-point">+</div>`,
            choices: "NO_KEYS",
            trial_duration: EXPERIMENT_CONFIG.fixationDuration,
            post_trial_gap: 0
        };

        // 子环节2：空屏（0.5s）
        const blankTrial = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `<div style="width: 100%; height: 500px;"></div>`,
            choices: "NO_KEYS",
            trial_duration: EXPERIMENT_CONFIG.blankDuration,
            post_trial_gap: 0
        };

        // 子环节3：呈现图片（按空格键终止）
         const imageTrial = {
            type: jsPsychImageKeyboardResponse,
            stimulus: currentImage.imageUrl,
            choices: "NO_KEYS",  // 初始禁用所有按键
            prompt: `<div id="image-prompt" style="text-align: center; margin-top: 20px; color: #ffffff; font-size: 16px; visibility: hidden;">Press <kbd style="background: #ffffff; color: #333;">Space</kbd> to start evaluation</div>`,
            stimulus_height: 500,
            stimulus_width: 800,
            trial_duration: 3000,  // 3秒后自动结束此试次
            post_trial_gap: 0
        };

        // 3秒后：显示提示并允许按键
        const imageWaitTrial = {
            type: jsPsychImageKeyboardResponse,
            stimulus: currentImage.imageUrl,
            choices: [" "],  // 允许按空格
            prompt: `<div style="text-align: center; margin-top: 20px; color: #ffffff; font-size: 16px;">Press <kbd style="background: #ffffff; color: #333;">Space</kbd> to start evaluation</div>`,
            stimulus_height: 500,
            stimulus_width: 800,
            post_trial_gap: 0,
            on_finish: (data) => {
                currentImage.imageViewTime = data.rt + 3000;  // 总时长 = 3秒 + 反应时
            }
        };

        // 子环节4：维度1 - 美观度评分
        const beautyRatingTrial = {
            type: CustomRatingPlugin,
            labelLeft: "Very ugly",
            labelRight: "Very beautiful",
            prompt: "Please evaluate the aesthetic quality of the image",
            post_trial_gap: 300,
            on_finish: (data) => {
                currentImage.beautyScore = data.rating;
                // ✅ 记录本次试次的完整数据
                GLOBAL_DATA.experimentLog.push(
                    `${currentImage.imageId}\t${currentImage.imageType}\t${currentImage.beautyScore}\t${currentImage.imageViewTime}`
                );
                // 每完成一个试次就备份数据
                saveBackupData();
            }
        };

        // 将当前试次的5个子环节加入时间线
        timeline.push(fixationTrial, blankTrial, imageTrial, imageWaitTrial, beautyRatingTrial);
    }

    // -------------------------- 环节4：实验结束页（数据下载） --------------------------
    const endTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <div style="text-align: center; padding: 50px; background-color: #ffffff; border-radius: 15px; margin: 100px auto; max-width: 600px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid #e9ecef;">
                <h2 style="font-size: 28px; color: #28a745; margin-bottom: 30px;">✓ Experiment completed!</h2>
                <p style="font-size: 18px; margin-bottom: 40px; color: #495057;">Thank you for your participation!</p>
                <p style="font-size: 16px; margin-bottom: 30px; color: #6c757d;">Please click the button below to download your experimental data</p>
                <button id="js-download-btn" style="background: #007cba; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 10px;">
                    Download Experimental Data
                </button>
                <p style="font-size: 14px; margin-top: 20px; color: #9ca3af;">
                    Data will be saved locally in TXT format<br>
                    If download fails, data will be displayed in a new window for copying
                </p>
                <div id="download-status" style="margin-top: 15px; font-size: 14px;"></div>
            </div>
        `,
        choices: "NO_KEYS",
        on_load: () => {
            document.body.style.backgroundColor = "#f8f9fa"; // ✅ 恢复白色背景
            
            setTimeout(() => {
                const statusDiv = document.getElementById("download-status");
                
                document.getElementById("js-download-btn").addEventListener("click", () => {
                    const dataText = GLOBAL_DATA.experimentLog.join("\n");
                    const timestamp = new Date().toLocaleString().replace(/[:/ ]/g, "-");
                    const fileName = `${GLOBAL_DATA.subjectName}_ExperimentData_${timestamp}.txt`;
                    
                    if (downloadData(dataText, fileName)) {
                        statusDiv.textContent = "✓ Data download successful!";
                        statusDiv.style.color = "#28a745";
                        // 清除本地备份
                        localStorage.removeItem('experiment_backup');
                    } else {
                        statusDiv.textContent = "⚠ Auto-download failed, data displayed in new window for copying";
                        statusDiv.style.color = "#ffc107";
                    }
                });
                
            }, 100);
        }
    };
    timeline.push(endTrial);

    return timeline;
}

// 添加键盘快捷键支持 - Ctrl+S 紧急下载
document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (GLOBAL_DATA.experimentLog.length > 1) {
            const dataText = GLOBAL_DATA.experimentLog.join("\n");
            const timestamp = new Date().toLocaleString().replace(/[:/ ]/g, "-");
            const fileName = `${GLOBAL_DATA.subjectName}_EmergencyBackup_${timestamp}.txt`;
            downloadData(dataText, fileName);
        }
    }
});

// 页面关闭前保存数据
window.addEventListener('beforeunload', function(event) {
    if (GLOBAL_DATA.experimentLog.length > 1) {
        saveBackupData();
    }
});
