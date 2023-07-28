let quizTypes = Object.keys(questionData);

let currentQuestion = 0;
let currentQuizName = null;
let currentQuestions = null;

//If questions just got are initiated -> shuffle them

//If questions have already been initiated -> overwrite initiated question data with the locally saved data


function init() {
    loadItems();
    renderNavItems();
    if (currentQuestions != null) {
        setItemInvisible("startCard");
        setItemInvisible("selectQuizCard");
        setItemVisible("questionCard");
        renderQuiz();
    }
}

function showQuizSelection() {
    setItemInvisible("startCard");
    setItemVisible("selectQuizCard");
    document.getElementById("quizTypeButtons").innerHTML = getQuizOptionsHtml()
}

function saveItems() {
    let questionsText = JSON.stringify(currentQuestions);
    localStorage.setItem('questions', questionsText);
}


function selectQuizQuestions(givenQuizId) {
    currentQuizName=quizTypes[givenQuizId];
    currentQuestions=questionData[currentQuizName];
    shuffleAllQuestions();
    init();
    setNavItemActive(currentQuizName);
}


function getQuizOptionsHtml() {
    html = "";
    for (let i = 0; i < quizTypes.length; i++) {
        html += `<button class='btn btn-start' onclick='selectQuizQuestions(${i})'>${quizTypes[i]}</button>`;
    }
    return html;
}


function loadItems() {
    let questionsText = localStorage.getItem('questions');
    if (questionsText) {
        currentQuestions = JSON.parse(questionsText);
    }
}


function shuffleAllQuestions() {
    for (let i = 0; i < currentQuestions.length; i++) {
        currentQuestions[i]['Answers'] = shuffle(currentQuestions[i]['Answers']);
    }
}

function renderQuiz() {
    
    if (checkIfQuizComplete() == false) {
        renderQuestion();
        renderAnswers();
        renderProgress();
        saveItems(); //checken ob nötig
    } else {
        completeQuiz();
    }

}

function setItemVisible(cardId){
    document.getElementById(cardId).style = "";
}


function setItemInvisible(cardId){
    document.getElementById(cardId).style = "display: none !important;";
}


function renderQuestion() {
    document.getElementById("question-title").innerHTML = `Frage ${currentQuestion + 1}`;
    document.getElementById("question-text").innerHTML = currentQuestions[currentQuestion]["Question"];
}


function resetQuiz() {
    currentQuestion = 0;
    currentQuizName = null;
    localStorage.removeItem("questions");


    //Folgender Fall: Wenn ich nur den array auf den Wert null setze, dann bleiben die "Selected" Werte kurzzeitig erhalten. Wenn ich diese hier explizit lösche, dann funktioniert es
    for(let i=0;i<currentQuestions.length;i++){
        currentQuestions[i]["Selected"]=null;
    }
    currentQuestions = null;


    setItemVisible("startCard");
    setItemInvisible("selectQuizCard");
    setItemInvisible("questionCard");
    setItemInvisible("resultCard");
    setItemInvisible("trophyImg");
    init();
}


function renderAnswers() {
    let answers = (currentQuestions[currentQuestion]["Answers"]);
    document.getElementById("answers").innerHTML = getAnswersHtml(answers);

    //If the User has already given an answer for this question
    if (currentQuestions[currentQuestion]["Selected"] != null) {
        checkAnswer(currentQuestions[currentQuestion]["Selected"]);

    }
}


function getAnswersHtml(answers) {
    let html = "";

    for (let i = 0; i < answers.length; i++) {
        html += `<li class="li-default" onClick="javascript:checkAnswer(${i})">
        <button class="btn quiz-btn " id="answer_${i}">${answers[i]}</button>
        </li>`;
    }

    return html;
}


function checkAnswer(answerId) {
    let answerState = answerValidation(answerId,currentQuestion);

    if (answerState) {
        setAnswerCorrect(answerId);
    } else {
        setAnswerWrong(answerId);
        setTrueAnswerCorrect();
    }
    setSelectedAnswer(answerId);
}


function answerValidation(answerId,questionId) {
    return currentQuestions[questionId]["Answers"][answerId] == currentQuestions[questionId]["CorrectAnswer"];
}


function setAnswerWrong(answerId) {
    document.getElementById(`answer_${answerId}`).parentNode.classList.add('li-danger');
}


function setSelectedAnswer(answerId) {
    currentQuestions[currentQuestion]["Selected"] = answerId;
    renderProgress();
    saveItems();
}


function setAnswerCorrect(answerId) {
    document.getElementById(`answer_${answerId}`).parentNode.classList.add('li-success');
}


function setTrueAnswerCorrect() {
    let answerState = false;
    for (let i = 0; i < currentQuestions[currentQuestion]["Answers"].length; i++) {
        answerState = answerValidation([i],currentQuestion);
        if (answerState) {
            setAnswerCorrect(i);
            break;
        };
    }
}


function renderProgress() {
    document.getElementById("progress-bar").innerHTML = getProgressBarHtml();
    document.getElementById("progress-text").innerHTML = getProgressInformationHtml();
}


function getProgressInformationHtml() {
    return `Frage (${currentQuestion + 1} von ${currentQuestions.length})`;
}


function getProgressBarHtml() {
    if (currentQuestions.length > 0) {
        let progressValue = (getAnsweredQuestionsAmount() / currentQuestions.length) * 100;
        html = `<div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${progressValue}%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${progressValue}%</div>
        </div>`;
    } else {
        html = ``;
    }
    return html;
}


function getAnsweredQuestionsAmount() {
    let amount = 0;
    for (const arrayElement of currentQuestions) {
        if (arrayElement["Selected"] != null) {
            amount++;
        }
    }
    return amount;
}


function checkIfQuizComplete() {
    if (getAnsweredQuestionsAmount() == currentQuestions.length) {
        return true;
    } else {
        return false;
    }
}

function getCorrectAnswersAmount() {
    let correctAnswers = 0;
    for(let i=0;i<currentQuestions.length;i++){
            if (currentQuestions[i]["Selected"] != null) {
                if (answerValidation(currentQuestions[i]["Selected"],i)) {
                    correctAnswers++;
            }
        }
    }

    return correctAnswers;
}


function quizResultSimple() {
    let correctAnswers = getCorrectAnswersAmount();
    return `Your Score: ${correctAnswers} / ${currentQuestions.length}`;
}

function completeQuiz() {
    setItemVisible("resultCard");
    setItemVisible("trophyImg");
    setItemInvisible("questionCard");
    document.getElementById("result-text").innerHTML = quizResultSimple();
}


function goToNextQuestion() {
    if (currentQuestion < (currentQuestions.length - 1)) {
        currentQuestion++;
        renderQuiz();
    } else {
        if (checkIfQuizComplete()) {
            completeQuiz();
        }

    }
}


function goToPreviousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
    }
    renderQuiz();
}

function renderNavItems(){
    navBar=document.getElementById("navbar");
    navBar.innerHTML=getNavItemsHtml();
}

function getNavItemsHtml(){
    html=``;
    for(let i=0;i<quizTypes.length;i++){
        html+=` <li class="nav-item" id="${quizTypes[i]}">
                    <p class="px-3" >${quizTypes[i]}</p>
                </li>`;
    }
    return html;
}

function setNavItemActive(itemId){
    console.log(itemId);
    element=document.getElementById(itemId);
    element.classList.add("border-start");
    element.classList.add("border-5");
    element.classList.add("border-white");
}

function setCurrentActiveQuizType(){
    document.getElementById
}


function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}