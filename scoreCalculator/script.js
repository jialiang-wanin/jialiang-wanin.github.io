// 根據複雜度等級獲取對應的績效分
function getComplexityScore(level) {
    if (level <= 0) return 0;
    else if (level === 1) return 0.02;
    else if (level === 2) return 0.06;
    else if (level === 3) return 0.1;
    else if (level === 4) return 0.15;
    else if (level === 5) return 0.23;
    else if (level === 6) return 0.35;
    else if (level === 7) return 0.5;
    else if (level === 8) return 0.7;
    else if (level === 9) return 0.9;
    else if (level === 10) return 1.1;
    else return 1.1 + (level - 10) * 0.2; // 10+ 的複雜度，每級+0.2
}

const MAX_UNITS = 5;

document.addEventListener('DOMContentLoaded', function () {
    const projectTypeSelect = document.getElementById('projectType');
    const jsonSlider = document.getElementById('jsonSlider');
    const jsonSliderValue = document.getElementById('jsonSliderValue');
    const mainDocDifficulty = document.getElementById('mainDocDifficulty');
    const openSiteDocDifficulty = document.getElementById('openSiteDocDifficulty');


    // 專案類型變化監聽器
    projectTypeSelect.addEventListener('change', handleProjectTypeChange);

    // 滑動條變化監聽器
    if (jsonSlider && jsonSliderValue) {
        jsonSlider.addEventListener('input', function () {
            const value = parseFloat(this.value);
            jsonSliderValue.textContent = value.toFixed(2);
            updateBaseScore();
        });
    }

    // 主功能文件難易度變化監聽器
    if (mainDocDifficulty) {
        mainDocDifficulty.addEventListener('change', updateBaseScore);
    }

    // 開站文件篇幅變化監聽器
    if (openSiteDocDifficulty) {
        openSiteDocDifficulty.addEventListener('change', updateBaseScore);
    }

    // 負責比例輸入驗證（只允許 1-100 整數）
    const responsibilityRatio = document.getElementById('responsibilityRatio');
    if (responsibilityRatio) {
        responsibilityRatio.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
            if ((parseInt(this.value) || 0) > 100) this.value = 100;
        });
        responsibilityRatio.addEventListener('blur', function () {
            if (this.value === '' || parseInt(this.value) < 1) this.value = 1;
        });
    }
});


function handleProjectTypeChange() {
    const projectType = document.getElementById('projectType').value;
    const jsonSliderContainer = document.getElementById('jsonSliderContainer');
    const mainDocContainer = document.getElementById('mainDocContainer');
    const mainDocDifficulty = document.getElementById('mainDocDifficulty');
    const openSiteDocContainer = document.getElementById('openSiteDocContainer');
    const openSiteDocDifficulty = document.getElementById('openSiteDocDifficulty');

    // 隱藏所有選項相關的容器
    jsonSliderContainer.classList.add('hidden');
    mainDocContainer.classList.add('hidden');
    openSiteDocContainer.classList.add('hidden');

    // 根據選擇顯示相應的容器
    if (projectType === 'json') {
        jsonSliderContainer.classList.remove('hidden');
    } else if (projectType === 'mainDoc') {
        mainDocContainer.classList.remove('hidden');
        // 重置文件難主功能易度選擇
        mainDocDifficulty.selectedIndex = 0;
    }
    else if (projectType === 'openSiteDoc') {
        openSiteDocContainer.classList.remove('hidden');
        // 重置選擇
        openSiteDocDifficulty.selectedIndex = 0;
    }

    const isSimpleProject = projectType === '0.02' || projectType === 'json';

    // 獲取步驟二和步驟三的所有輸入元素
    const step2Elements = document.querySelectorAll('#calculatorForm .section:nth-of-type(3) input, #calculatorForm .section:nth-of-type(3) select, #calculatorForm .section:nth-of-type(3) button');
    const step3Section = document.querySelector('#calculatorForm .section:nth-of-type(4)');

    if (isSimpleProject) {
        // 禁用步驟二的所有元素
        step2Elements.forEach(element => {
            element.disabled = true;
            if (element.type === 'checkbox') {
                element.checked = false;
            } else if (element.tagName === 'SELECT') {
                element.selectedIndex = 0;
            } else if (element.type === 'text' || element.type === 'number') {
                element.value = '';
            }
        });

        // 清除複雜度結果顯示
        document.getElementById('complexityResult').classList.add('hidden');
        document.getElementById('baseResult').classList.add('hidden');

    } else {
        // 啟用步驟二的所有元素
        step2Elements.forEach(element => {
            element.disabled = false;
        });

        // 顯示步驟三
        step3Section.style.opacity = '1';
        step3Section.style.pointerEvents = 'auto';
    }

    // 更新基礎分數顯示
    updateBaseScore();
}


function addUnit() {
    const container = document.getElementById('unitContainer');
    const currentUnits = container.querySelectorAll('.unit-input').length;

    if (currentUnits >= MAX_UNITS) {
        alert('最多只能新增 5 個單位');
        return;
    }

    const newInput = document.createElement('div');
    newInput.classList.add('unit-input');
    newInput.innerHTML = `
        <input type="text" class="unit-name" placeholder="請輸入單位名稱">
        <button type="button" class="remove-unit secondary-button" onclick="removeUnit(this)">刪除</button>
    `;
    container.appendChild(newInput);
}

function removeUnit(button) {
    const container = document.getElementById('unitContainer');
    container.removeChild(button.parentElement);
}

// 通用的無條件補差值函式
function ceilTo(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    // 先用 toFixed 轉成字串再轉回數字，消除浮點誤差
    const safeValue = Number(value.toFixed(decimals + 2));
    return Math.ceil(safeValue * factor) / factor;
}

function calculateScore() {
    // 獲取專案名稱
    const projectName = document.getElementById('projectName').value.trim();
    if (!projectName) {
        alert('請輸入專案名稱');
        return;
    }

    // 步驟一：獲取基礎績效分
    let baseScore = 0;
    const projectType = document.getElementById('projectType').value;

    if (projectType === 'json') {
        const jsonSlider = document.getElementById('jsonSlider');
        baseScore = jsonSlider ? parseFloat(jsonSlider.value) : 0.05;
    } else if (projectType === 'mainDoc') {
        const mainDocDifficulty = document.getElementById('mainDocDifficulty').value;
        if (!mainDocDifficulty) {
            alert('請選擇主功能文件難易度');
            return;
        }
        baseScore = parseFloat(mainDocDifficulty);
    } // 開站文件計算邏輯
    else if (projectType === 'openSiteDoc') {
        const openSiteDocDifficulty = document.getElementById('openSiteDocDifficulty').value;
        if (!openSiteDocDifficulty) {
            alert('請選擇開站文件篇幅');
            return;
        }
        baseScore = parseFloat(openSiteDocDifficulty);
    }
    else {
        baseScore = parseFloat(projectType) || 0;
    }


    if (baseScore === 0) {
        alert('請選擇專案類型');
        return;
    }

    document.getElementById('baseScoreResult').classList.remove('hidden');
    document.getElementById('baseScoreResult').innerHTML = `基礎績效分：${baseScore.toFixed(2)}`;

    // 步驟二：計算複雜度
    // 計算額外複雜度
    let totalComplexity = 0;

    // 平台處以外單位溝通
    const unitInputs = document.querySelectorAll('.unit-name');
    const unitNames = [];
    const nameSet = new Set();

    for (const input of unitInputs) {
        const name = input.value.trim();
        if (name !== '') {
            if (nameSet.has(name)) {
                alert(`單位名稱重複：${name}`);
                input.focus();
                return;
            }
            nameSet.add(name);
            unitNames.push(name);
        }
    }

    // 單位溝通複雜度分級：1~2 單位→+1、3→+2、4→+3、5→+4（至少 1，之後每多 1 單位 +1）
    const unitCount = unitNames.length;
    const communicationComplexity = unitCount === 0 ? 0 : Math.max(1, unitCount - 1);
    totalComplexity += communicationComplexity;

    // 其他產品串聯
    let productLinkComplexity = 0;
    const productLinks = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    productLinks.forEach(link => {
        productLinkComplexity += parseInt(link.value) || 0;
    });

    // 自定義產品串聯1
    if (document.getElementById('customLink1').checked) {
        productLinkComplexity += 1;
    }

    // 自定義產品串聯2
    if (document.getElementById('customLink2').checked) {
        productLinkComplexity += 1;
    }

    totalComplexity += productLinkComplexity;

    // 連動功能數量
    const connectedFeaturesComplexity = parseInt(document.getElementById('connectedFeatures').value) || 0;
    totalComplexity += connectedFeaturesComplexity;

    // 新字串量
    const newStringsComplexity = parseInt(document.getElementById('newStrings').value) || 0;
    totalComplexity += newStringsComplexity;


    // 額外複雜度判定
    const extraComplexity = parseInt(document.getElementById('extraComplexity').value) || 0;
    const extraComplexityReason = document.getElementById('extraComplexityReason').value.trim();
    // 檢查邏輯：如果有填複雜度但沒填原因
    if (extraComplexity > 0 && extraComplexityReason === '') {
        alert('請填寫額外複雜度的原因');
        document.getElementById('extraComplexityReason').focus();
        return; // 中止計算流程
    }

    // 通過檢查後，才進行加總
    totalComplexity += extraComplexity;

    // 計算複雜度績效分
    const complexityScore = getComplexityScore(totalComplexity);

    // 準備產品串聯的詳細資訊
    let productLinkDetails = [];
    if (document.getElementById('appLink').checked) productLinkDetails.push("APP");
    if (document.getElementById('mahjongLink').checked) productLinkDetails.push("麻將");
    if (document.getElementById('fogLink').checked) productLinkDetails.push("FOG");
    if (document.getElementById('gashLink').checked) productLinkDetails.push("GASH");
    if (document.getElementById('thirdPartyLink').checked) productLinkDetails.push("第三方登入");

    if (document.getElementById('customLink1').checked) {
        const custom1Name = document.getElementById('customLink1Text').value.trim() || "其他1";
        productLinkDetails.push(custom1Name);
    }

    if (document.getElementById('customLink2').checked) {
        const custom2Name = document.getElementById('customLink2Text').value.trim() || "其他2";
        productLinkDetails.push(custom2Name);
    }

    const productLinkText = productLinkDetails.length > 0 ? productLinkDetails.join(", ") : "無";

    document.getElementById('complexityResult').classList.remove('hidden');
    document.getElementById('complexityResult').innerHTML = `
                複雜度總和：${totalComplexity} (溝通: +${communicationComplexity}, 產品串聯: +${productLinkComplexity}, 連動功能: +${connectedFeaturesComplexity}, 新字串量: +${newStringsComplexity}, 額外複雜度: +${extraComplexity})<br>
                複雜度績效分：${complexityScore.toFixed(2)}
            `;

    // 步驟三：計算專案基本分（＝最終分數）
    const totalBaseAndComplexity = baseScore + complexityScore;
    document.getElementById('baseResult').classList.remove('hidden');
    document.getElementById('baseResult').innerHTML = `
                基礎績效分 (${baseScore.toFixed(2)}) + 複雜度績效分 (${complexityScore.toFixed(2)}) = 專案基本分 ${totalBaseAndComplexity.toFixed(2)}
            `;

    // 步驟四：負責比例
    const responsibilityRatioInput = document.getElementById('responsibilityRatio');
    const responsibilityRatio = parseInt(responsibilityRatioInput.value) || 0;
    if (responsibilityRatio < 1 || responsibilityRatio > 100) {
        alert('請輸入有效的負責比例 (1-100%)');
        responsibilityRatioInput.focus();
        return;
    }
    const responsibilityRatioDecimal = responsibilityRatio / 100;

    // 最終分數 = 專案基本分 × 負責比例，無條件進位到小數第 2 位
    const finalScore = totalBaseAndComplexity * responsibilityRatioDecimal;
    const truncatedScore = ceilTo(finalScore, 2);

    // 顯示結果
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('projectNameResult').innerHTML = `專案名稱：${projectName}`;
    document.getElementById('scoreResult').innerHTML = `<strong>最終專案分數：${truncatedScore.toFixed(2)}</strong>`;

    // 顯示詳細計算過程
    let breakdownHTML = `
                <p><strong>完整計算過程：</strong></p>
                <ol>
                    <li><strong>基礎績效分：</strong> ${baseScore.toFixed(2)}</li>
                    <li><strong>複雜度計算：</strong>
                        <ul>
                            <li>平台處以外單位溝通：+${communicationComplexity}（${unitNames.join(', ') || '無'}）</li>
                            <li>其他產品串聯 (+${productLinkComplexity})：${productLinkText}</li>
                            <li>連動功能數量：+${connectedFeaturesComplexity}</li>
                            <li>新字串量：+${newStringsComplexity}</li>
            `;

    if (extraComplexity > 0) {
        breakdownHTML += `<li>額外複雜度：+${extraComplexity}${extraComplexityReason ? ` (${extraComplexityReason})` : ''}</li>`;
    }

    breakdownHTML += `
                            <li>複雜度總和：${totalComplexity}，對應績效分：${complexityScore.toFixed(2)}</li>
                        </ul>
                    </li>
                    <li><strong>專案基本分：</strong> ${baseScore.toFixed(2)} + ${complexityScore.toFixed(2)} = ${totalBaseAndComplexity.toFixed(2)}</li>
                    <li><strong>負責比例：</strong> ×${responsibilityRatio}% (${responsibilityRatioDecimal.toFixed(2)})</li>
                </ol>
                <p><strong>最終專案分數：</strong> ${totalBaseAndComplexity.toFixed(2)} × ${responsibilityRatioDecimal.toFixed(2)} = ${finalScore.toFixed(4)} → 無條件進位至小數第 2 位 = <strong>${truncatedScore.toFixed(2)}</strong></p>
            `;

    document.getElementById('breakdown').innerHTML = breakdownHTML;
}

// 更新基礎分數顯示的函數
function updateBaseScore() {
    const projectTypeSelect = document.getElementById('projectType');
    const jsonSlider = document.getElementById('jsonSlider');
    const mainDocDifficulty = document.getElementById('mainDocDifficulty');
    const openSiteDocDifficulty = document.getElementById('openSiteDocDifficulty');
    const baseScoreResult = document.getElementById('baseScoreResult');

    if (!projectTypeSelect || !baseScoreResult) return;

    const selectedValue = projectTypeSelect.value;
    let score = 0;
    let description = '';

    if (selectedValue === '') {
        baseScoreResult.classList.add('hidden');
        return;
    }

    if (selectedValue === 'json') {
        score = jsonSlider ? parseFloat(jsonSlider.value) : 0.05;
        description = `JSON相關(開卡請系統協助上傳) (${score.toFixed(2)})`;
    } else if (selectedValue === 'mainDoc') {
        const difficultyValue = mainDocDifficulty ? mainDocDifficulty.value : '';
        if (difficultyValue) {
            score = parseFloat(difficultyValue);
            const option = mainDocDifficulty.querySelector(`option[value="${difficultyValue}"]`);
            description = `主功能文件 - ${option ? option.textContent : ''}`;
        } else {
            score = 0;
            description = '主功能文件 (請選擇難易度)';
        }
    } // 開站文件顯示邏輯
    else if (selectedValue === 'openSiteDoc') {
        const difficultyValue = openSiteDocDifficulty ? openSiteDocDifficulty.value : '';
        if (difficultyValue) {
            score = parseFloat(difficultyValue);
            // 抓取選項文字來顯示
            const option = openSiteDocDifficulty.querySelector(`option[value="${difficultyValue}"]`);
            // 只顯示括號前的文字讓畫面乾淨點，或者直接顯示全部
            description = `開站文件 - ${option ? option.textContent.split('(')[0] : ''} (${score})`;
        } else {
            score = 0;
            description = '開站文件 (請選擇篇幅)';
        }
    }

    else {
        score = parseFloat(selectedValue);
        const option = projectTypeSelect.querySelector(`option[value="${selectedValue}"]`);
        description = option ? option.textContent : '';
    }

    baseScoreResult.innerHTML = `
        <strong>基礎績效分：${score.toFixed(2)}</strong><br>
        <span style="color: #64748b; font-size: 0.9em;">${description}</span>
    `;
    baseScoreResult.classList.remove('hidden');
}

// 將結果卡片轉成圖片並複製到剪貼簿（不支援時 fallback 為下載 PNG）
async function copyResultImage() {
    const result = document.getElementById('result');
    const btn = result.querySelector('.copy-image-button');
    const hint = document.getElementById('copyHint');
    const originalText = btn.textContent;

    if (typeof html2canvas === 'undefined') {
        showHint(hint, '❌ 圖片產生元件尚未載入，請稍候再試');
        return;
    }

    btn.disabled = true;
    btn.textContent = '產生圖片中…';

    try {
        const canvas = await html2canvas(result, {
            backgroundColor: '#ffffff',
            scale: 2,
            // 截圖時排除按鈕列本身
            ignoreElements: (el) => el.classList && el.classList.contains('result-actions')
        });

        canvas.toBlob(async (blob) => {
            try {
                if (!blob) throw new Error('blob 產生失敗');
                if (navigator.clipboard && window.ClipboardItem) {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    showHint(hint, '✅ 已複製到剪貼簿，可直接貼上！');
                } else {
                    throw new Error('此瀏覽器不支援複製圖片');
                }
            } catch (e) {
                // fallback：改成下載 PNG
                const projectName = document.getElementById('projectName').value.trim() || '專案分數';
                const link = document.createElement('a');
                link.download = `${projectName}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                showHint(hint, '⬇️ 此瀏覽器不支援複製圖片，已改為下載');
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }, 'image/png');
    } catch (e) {
        showHint(hint, '❌ 產生圖片失敗：' + e.message);
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

function showHint(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(el._hintTimer);
    el._hintTimer = setTimeout(() => el.classList.add('hidden'), 4000);
}
