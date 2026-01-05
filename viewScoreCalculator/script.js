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

// 核心計算函數
function calculateScore() {
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
                <li>關卡：第0關 (洛嘉審閱)</li>
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

        // 額外
        const extra = parseInt(document.getElementById('l1_extra').value) || 0;
        if (extra > 0) {
            complexityLevel += extra;
            details.push(`額外指定加權 (+${extra}級)`);
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

        // 機制錯誤
        if (document.getElementById('l2_minorError').checked) {
            complexityLevel += 1;
            details.push(`普通機制錯誤 (+1級)`);
        }
        if (document.getElementById('l2_majorError').checked) {
            complexityLevel += 2;
            details.push(`重大機制錯誤 (+2級)`);
        }

        // 額外
        const extra = parseInt(document.getElementById('l2_extra').value) || 0;
        if (extra > 0) {
            complexityLevel += extra;
            details.push(`額外指定加權 (+${extra}級)`);
        }

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
