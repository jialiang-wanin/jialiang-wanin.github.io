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
});


function handleProjectTypeChange() {
    const projectType = document.getElementById('projectType').value;
    const jsonSliderContainer = document.getElementById('jsonSliderContainer');
    const isSimpleProject = projectType === '0.02' || projectType === 'json'; // 修改這裡，將 '0.05' 改為 'json'

    // JSON 滑動條顯示/隱藏邏輯
    if (projectType === 'json') {
        jsonSliderContainer.classList.remove('hidden');
    } else {
        jsonSliderContainer.classList.add('hidden');
    }

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
    } else {
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

    const communicationComplexity = unitNames.length;
    if (communicationComplexity == 1 || communicationComplexity == 2) {
        communicationComplexity == 1
    }
    console.log(`有效單位數量：${communicationComplexity}`);
    console.log(`單位名稱：${unitNames.join(', ')}`);
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

    // 急件
    const urgentComplexity = parseInt(document.getElementById('urgent').value) || 0;
    totalComplexity += urgentComplexity;

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
                複雜度總和：${totalComplexity} (溝通: +${communicationComplexity}, 產品串聯: +${productLinkComplexity}, 連動功能: +${connectedFeaturesComplexity}, 新字串量: +${newStringsComplexity}, 急件: +${urgentComplexity}, 額外複雜度: +${extraComplexity})<br>
                複雜度績效分：${complexityScore.toFixed(2)}
            `;

    // 步驟三：計算基本分
    const totalBaseAndComplexity = baseScore + complexityScore;
    document.getElementById('baseResult').classList.remove('hidden');
    document.getElementById('baseResult').innerHTML = `
                基礎績效分 (${baseScore.toFixed(2)}) + 複雜度績效分 (${complexityScore.toFixed(2)}) = 專案基本分 ${totalBaseAndComplexity.toFixed(2)}
            `;

    // 步驟四：獲取權重
    const positionWeight = parseFloat(document.getElementById('position').value) || 0;
    if (positionWeight === 0) {
        alert('請選擇職等');
        return;
    }

    const yearsWeight = parseFloat(document.getElementById('yearsOfService').value) || 0;
    if (yearsWeight === 0) {
        alert('請選擇年資');
        return;
    }

    const projectLeadWeight = parseFloat(document.getElementById('isProjectLead').value) || 1.0;

    // 計算最終分數
    const finalScore = totalBaseAndComplexity * positionWeight * yearsWeight * projectLeadWeight;

    // 顯示結果
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('projectNameResult').innerHTML = `專案名稱：${projectName}`;
    const truncatedScore = Math.floor(finalScore * 100) / 100;
    document.getElementById('scoreResult').innerHTML = `<strong>最終專案分數：${truncatedScore.toFixed(2)}</strong>`;

    // 顯示詳細計算過程
    let breakdownHTML = `
                <p><strong>完整計算過程：</strong></p>
                <ol>
                    <li><strong>基礎績效分：</strong> ${baseScore.toFixed(2)}</li>
                    <li><strong>複雜度計算：</strong>
                        <ul>
                            <li>平台處以外單位溝通：+${communicationComplexity}（${unitNames.join(', ')}）</li>
                            <li>其他產品串聯 (+${productLinkComplexity})：${productLinkText}</li>
                            <li>連動功能數量：+${connectedFeaturesComplexity}</li>
                            <li>新字串量：+${newStringsComplexity}</li>
                            <li>急件：+${urgentComplexity}</li>
            `;

    if (extraComplexity > 0) {
        breakdownHTML += `<li>額外複雜度：+${extraComplexity}${extraComplexityReason ? ` (${extraComplexityReason})` : ''}</li>`;
    }

    breakdownHTML += `
                            <li>複雜度總和：${totalComplexity}，對應績效分：${complexityScore.toFixed(2)}</li>
                        </ul>
                    </li>
                    <li><strong>專案基本分：</strong> ${baseScore.toFixed(2)} + ${complexityScore.toFixed(2)} = ${totalBaseAndComplexity.toFixed(2)}</li>
                    <li><strong>應用權重：</strong>
                        <ul>
                            <li>職等績效權重：×${positionWeight.toFixed(2)}</li>
                            <li>年資權重：×${yearsWeight.toFixed(2)}</li>
                            <li>專業負責人權重：×${projectLeadWeight.toFixed(1)}</li>
                        </ul>
                    </li>
                </ol>
                <p><strong>最終計算公式：</strong> ${totalBaseAndComplexity.toFixed(2)} × ${positionWeight.toFixed(2)} × ${yearsWeight.toFixed(2)} × ${projectLeadWeight.toFixed(1)} = ${finalScore.toFixed(4)}</p>
            `;

    document.getElementById('breakdown').innerHTML = breakdownHTML;
}

// 更新基礎分數顯示的函數
function updateBaseScore() {
    const projectTypeSelect = document.getElementById('projectType');
    const jsonSlider = document.getElementById('jsonSlider');
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
    } else {
        score = parseFloat(selectedValue);
        const option = projectTypeSelect.querySelector(`option[value="${selectedValue}"]`);
        description = option ? option.textContent : '';
    }

    baseScoreResult.innerHTML = `
        <strong>基礎績效分：${score.toFixed(2)}</strong><br>
        <span style="color: #666; font-size: 0.9em;">${description}</span>
    `;
    baseScoreResult.classList.remove('hidden');
}
