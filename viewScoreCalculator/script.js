// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', function() {
    updateUI();
});

// 切換關卡時更新介面顯示
function updateUI() {
    const stage = document.getElementById('reviewStage').value;
    
    // 區塊元素
    const commonSection = document.getElementById('commonSection');
    const level0Input = document.getElementById('level0Input');
    const level1Input = document.getElementById('level1Input');
    const level2Input = document.getElementById('level2Input');
    const resultDiv = document.getElementById('result');

    // 先隱藏所有結果與特定區塊
    resultDiv.classList.add('hidden');
    commonSection.classList.add('hidden');
    level0Input.classList.add('hidden');
    level1Input.classList.add('hidden');
    level2Input.classList.add('hidden');

    // 根據選擇顯示對應區塊
    if (stage === '0') {
        level0Input.classList.remove('hidden');
    } else if (stage === '1') {
        commonSection.classList.remove('hidden');
        level1Input.classList.remove('hidden');
    } else if (stage === '2') {
        commonSection.classList.remove('hidden');
        level2Input.classList.remove('hidden');
    }
}

// 輔助函數：無條件進位至小數點第二位
function ceilToTwo(num) {
    return Math.ceil(num * 100) / 100;
}

// 輔助函數：取得職等權重
function getReviewerWeight(stage, level) {
    if (stage === '1') {
        if (level === 'intern') return 1.0;
        if (level === 'planner') return 1.15;
        if (level === 'senior') return 1.3;
    } else if (stage === '2') {
        if (level === 'intern') return 1.0; 
        if (level === 'planner') return 1.15;
        if (level === 'senior') return 1.3;
    }
    return 1.0;
}

// --- 動態錯誤清單功能 ---

// 新增一筆錯誤紀錄
function addErrorRow() {
    const select = document.getElementById('errorTypeSelect');
    const typeValue = parseInt(select.value); // 1 或 2
    const typeText = select.options[select.selectedIndex].text;
    const container = document.getElementById('errorListContainer');

    // 建立一個唯一的 ID (用於刪除或除錯)
    const rowId = 'err_' + Date.now();

    const row = document.createElement('div');
    // 根據類型加上不同的 class (major-error 用於紅色樣式)
    row.className = `error-row ${typeValue === 2 ? 'major-error' : ''}`;
    row.id = rowId;
    
    // 將分數存在 data-score 屬性中，方便計算時讀取
    row.dataset.score = typeValue;

    // 設定 HTML 內容
    row.innerHTML = `
        <span class="error-tag ${typeValue === 2 ? 'tag-major' : 'tag-minor'}">
            ${typeValue === 1 ? '普通' : '重大'} (+${typeValue})
        </span>
        <input type="text" class="error-desc-input" placeholder="請輸入錯誤說明 (必填)" required>
        <button type="button" class="remove-btn" onclick="removeErrorRow('${rowId}')">移除</button>
    `;

    container.appendChild(row);
    
    // 自動聚焦到新生成的輸入框
    row.querySelector('input').focus();
}

// 移除一筆錯誤紀錄
function removeErrorRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
    }
}


// 核心計算函數
function calculateScore() {
     // ---【新增 1】檢查專案名稱必填 ---
    const projectName = document.getElementById('projectName').value.trim();
    if (!projectName) {
        alert('請輸入「專案名稱」！');
        document.getElementById('projectName').focus(); // 幫使用者聚焦
        return; // 停止計算
    }
    const stage = document.getElementById('reviewStage').value;
    let finalScore = 0;
    let breakdownHTML = '';

    // ================= 第 0 關 (洛嘉) =================
    if (stage === '0') {
        const difficulty = parseFloat(document.getElementById('l0_difficulty').value);
        finalScore = difficulty;

        breakdownHTML = `
            <p><strong>計算過程：</strong></p>
            <ul>
                <li>關卡：第0關</li>
                <li><strong>專案名稱：</strong> ${projectName}</li>
                <li>機制複雜度定分：${difficulty}</li>
            </ul>
        `;
    } 
    
    // ================= 第 1 關 (郁庭／志謙) =================
    else if (stage === '1') {
        // 1. 基礎分
        const baseScore = parseFloat(document.getElementById('l1_base').value);
        
        // 2. 複雜度等級計算 (修正：從 0 開始)
        let complexityLevel = 0;
        let details = [];

        // 來回檢視
        const retryCount = parseInt(document.getElementById('l1_retryCount').value) || 0;
        if (retryCount >= 3) {
            complexityLevel += 1;
            details.push(`來回檢視 ${retryCount} 次 (+1級)`);
        }

        // 產品串聯
        const prodChecks = document.querySelectorAll('.l1-prod:checked');
        if (prodChecks.length > 0) {
            complexityLevel += prodChecks.length;
            details.push(`產品串聯 ${prodChecks.length} 項 (+${prodChecks.length}級)`);
        }

        // 連動功能
        const featVal = parseInt(document.getElementById('l1_features').value);
        if (featVal > 0) {
            complexityLevel += featVal;
            details.push(`連動功能加權 (+${featVal}級)`);
        }

        // 新字串
        const strVal = parseInt(document.getElementById('l1_strings').value);
        if (strVal > 0) {
            complexityLevel += strVal;
            details.push(`新字串量加權 (+${strVal}級)`);
        }

         // ---【修改開始】額外複雜度驗證邏輯 ---
        const extra = parseInt(document.getElementById('l1_extra').value) || 0;
        const extraReason = document.getElementById('l1_extra_reason').value.trim();

        if (extra > 0) {
            if (!extraReason) {
                alert('請輸入「額外複雜度」的加分原因！');
                document.getElementById('l1_extra_reason').focus(); // 幫使用者聚焦到輸入框
                return; // 停止計算
            }
            complexityLevel += extra;
            // 將使用者輸入的原因顯示在結果中
            details.push(`${extraReason} (+${extra}級)`);
        }

        // 3. 複雜度分數查表 (修正：處理 0 的情況)
        let complexityScore = 0;
        if (complexityLevel <= 0) complexityScore = 0; // Level 0 = 0分
        else if (complexityLevel === 1) complexityScore = 0.01;
        else if (complexityLevel === 2) complexityScore = 0.02;
        else if (complexityLevel === 3) complexityScore = 0.03;
        else if (complexityLevel === 4) complexityScore = 0.05;
        else if (complexityLevel === 5) complexityScore = 0.07;
        else {
            // 5+ 每級 +0.02
            complexityScore = 0.07 + (complexityLevel - 5) * 0.02;
        }

        // 4. 權重計算
        const isOpenSite = document.getElementById('isOpenSite').checked ? 0.9 : 1.0;
        const writerWeight = parseFloat(document.getElementById('writerLevel').value);
        const reviewerRole = document.getElementById('reviewerLevel').value;
        const reviewerWeight = getReviewerWeight('1', reviewerRole);

        // 5. 最終公式
        const rawScore = (baseScore + complexityScore) * isOpenSite * writerWeight * reviewerWeight;
        finalScore = ceilToTwo(rawScore);

        breakdownHTML = `
            <p><strong>計算過程：</strong></p>
            <ul>
                <li><strong>專案名稱：</strong> ${projectName}</li>
                <li><strong>基礎績效分：</strong> ${baseScore}</li>
                <li><strong>複雜度等級：</strong> Level ${complexityLevel}
                    <br><small style="color:#666">(${details.length > 0 ? details.join(', ') : '無額外加權'})</small>
                </li>
                <li><strong>複雜度績效分：</strong> ${complexityScore.toFixed(2)}</li>
                <li><strong>權重設定：</strong>
                    <ul>
                        <li>開站文件：x${isOpenSite}</li>
                        <li>撰寫人職等：x${writerWeight}</li>
                        <li>審閱人職等：x${reviewerWeight}</li>
                    </ul>
                </li>
                <li><strong>公式：</strong> (${baseScore} + ${complexityScore.toFixed(2)}) × ${isOpenSite} × ${writerWeight} × ${reviewerWeight} = ${rawScore.toFixed(4)}</li>
            </ul>
        `;
    }

    // ================= 第 2 關 (明哲／正輝／宇慈) =================
    else if (stage === '2') {
        // 1. 基礎分
        const baseScore = parseFloat(document.getElementById('l2_base').value);

        // 2. 複雜度等級計算 (修正：從 0 開始)
        let complexityLevel = 0;
        let details = [];

        // 來回檢視
        const retryCount = parseInt(document.getElementById('l2_retryCount').value) || 0;
        if (retryCount >= 3) {
            complexityLevel += 1;
            details.push(`來回檢視 ${retryCount} 次 (+1級)`);
        }

        // 錯誤數量
        const errVal = parseInt(document.getElementById('l2_errors').value);
        if (errVal > 0) {
            complexityLevel += errVal;
            details.push(`文字/流程錯誤加權 (+${errVal}級)`);
        }

        // 獲取所有動態產生的錯誤列
        const errorRows = document.querySelectorAll('#errorListContainer .error-row');
        
        // 遍歷每一列進行檢查與計算
        for (const row of errorRows) {
            const score = parseInt(row.dataset.score); // 從 data-score 屬性拿分數 (1 或 2)
            const input = row.querySelector('.error-desc-input');
            const desc = input.value.trim();

            // 驗證：說明必填
            if (!desc) {
                alert('請填寫所有的錯誤說明！');
                input.focus();
                return; // 停止計算
            }

            // 加分
            complexityLevel += score;
            
            // 記錄到詳細資訊 (格式：[普通] 說明文字 (+1級))
            const typeName = score === 2 ? '重大錯誤' : '普通錯誤';
            details.push(`${typeName}：${desc} (+${score}級)`);
        }

        // ---【修改開始】額外複雜度驗證邏輯 ---
        const extra = parseInt(document.getElementById('l2_extra').value) || 0;
        const extraReason = document.getElementById('l2_extra_reason').value.trim();

        if (extra > 0) {
            if (!extraReason) {
                alert('請輸入「額外複雜度」的加分原因！');
                document.getElementById('l2_extra_reason').focus();
                return; // 停止計算
            }
            complexityLevel += extra;
            details.push(`${extraReason} (+${extra}級)`);
        }
        // ---【修改結束】---
        
        // 3. 複雜度分數查表 (第2關表)
        let complexityScore = 0;
        // 第2關表：Level 1 是 0分，Level 2 才是 0.01
        // 所以 Level 0 和 Level 1 都是 0分
        if (complexityLevel <= 1) complexityScore = 0; 
        else if (complexityLevel === 2) complexityScore = 0.01;
        else if (complexityLevel === 3) complexityScore = 0.02;
        else if (complexityLevel === 4) complexityScore = 0.03;
        else if (complexityLevel === 5) complexityScore = 0.05;
        else {
            // 5+ 每級 +0.02
            complexityScore = 0.05 + (complexityLevel - 5) * 0.02;
        }

        // 4. 權重計算
        const isOpenSite = document.getElementById('isOpenSite').checked ? 0.9 : 1.0;
        const writerWeight = parseFloat(document.getElementById('writerLevel').value);
        const reviewerRole = document.getElementById('reviewerLevel').value;
        const reviewerWeight = getReviewerWeight('2', reviewerRole);

        // 5. 最終公式
        const rawScore = (baseScore + complexityScore) * isOpenSite * writerWeight * reviewerWeight;
        finalScore = ceilToTwo(rawScore);

        breakdownHTML = `
            <p><strong>計算過程：</strong></p>
            <ul>
                <li><strong>專案名稱：</strong> ${projectName}</li>
                <li><strong>基礎績效分：</strong> ${baseScore}</li>
                <li><strong>複雜度等級：</strong> Level ${complexityLevel}
                    <br><small style="color:#666">(${details.length > 0 ? details.join(', ') : '無額外加權'})</small>
                </li>
                <li><strong>複雜度績效分：</strong> ${complexityScore.toFixed(2)}</li>
                <li><strong>權重設定：</strong>
                    <ul>
                        <li>開站文件：x${isOpenSite}</li>
                        <li>撰寫人職等：x${writerWeight}</li>
                        <li>審閱人職等：x${reviewerWeight}</li>
                    </ul>
                </li>
                <li><strong>公式：</strong> (${baseScore} + ${complexityScore.toFixed(2)}) × ${isOpenSite} × ${writerWeight} × ${reviewerWeight} = ${rawScore.toFixed(4)}</li>
            </ul>
        `;
    }

    // 顯示結果
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('scoreResult').innerHTML = `最終分數：${finalScore.toFixed(2)}`;
    document.getElementById('breakdown').innerHTML = breakdownHTML;
}
