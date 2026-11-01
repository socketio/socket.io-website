<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Digital Scoring Pencak Silat Cloud</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; user-select: none; }
        body { background: #0a0a0a; color: #fff; width: 100vw; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px; }
        .hidden { display: none !important; }
        .card { background: #1a1a1a; padding: 15px; border-radius: 12px; border: 1px solid #333; text-align: center; width: 100%; max-width: 500px; }
        input { font-size: 16px; padding: 10px; width: 90%; margin: 10px 0; border-radius: 6px; border: 1px solid #555; background: #222; color: #fff; text-align: center; }
        button { font-weight: bold; border: none; border-radius: 8px; cursor: pointer; transition: transform 0.1s; }
        button:active { transform: scale(0.96); }
        .grid-roles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
        .btn-role { background: #0056b3; color: #fff; padding: 12px; font-size: 14px; }
        .btn-display { background: #ffc107; color: #000; grid-column: span 3; padding: 14px; font-size: 16px; }
        .app-container { width: 100vw; min-height: 100vh; padding: 10px; display: grid; grid-template-rows: auto 1fr; gap: 8px; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; background: #151515; padding: 6px 15px; border-radius: 8px; border: 1px solid #282828; }
        .timer-display { font-size: 28px; font-weight: bold; background: #000; padding: 2px 15px; border-radius: 6px; border: 1px solid #444; color: #00ff66; }
        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; height: 100%; }
        .corner-box { border-radius: 10px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between; }
        .blue-corner { background: linear-gradient(145deg, #002b5b, #001530); border: 2px solid #0056b3; }
        .red-corner { background: linear-gradient(145deg, #5b0000, #300000); border: 2px solid #b30000; }
        .score-num { font-size: 65px; font-weight: 900; line-height: 1; margin: 5px 0; text-align: center; }
        .penalty-badge { font-size: 11px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px; margin: 2px; display: inline-block; }
        .btn-grid-juri { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; height: 100%; }
        .btn-score { background: #ffc107; color: #000; font-size: 16px; padding: 12px 5px; }
        .btn-deduct { background: #444; color: #fff; font-size: 13px; }
        .btn-foul { background: #d9534f; color: #fff; font-size: 12px; padding: 10px; }
    </style>
    <!-- Firebase SDK Cloud Database -->
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
</head>
<body>

    <div id="setupScreen" class="card">
        <h2 style="color:#ffc107;">SILAT SCORING CLOUD</h2>
        <p style="font-size: 12px; color: #aaa; margin-top:5px;">Sinkronisasi Antar HP Secara Online</p>
        <input type="text" id="matrasCode" value="ARENA-1" placeholder="Kode Matras">
        <div class="grid-roles">
            <button class="btn-role btn-display" onclick="setRole('display')">📺 SCOREBOARD UTAMA (DISPLAY)</button>
            <button class="btn-role" onclick="setRole('juri1')">⚖️ JURI 1</button>
            <button class="btn-role" onclick="setRole('juri2')">⚖️ JURI 2</button>
            <button class="btn-role" onclick="setRole('juri3')">⚖️ JURI 3</button>
            <button class="btn-role" style="background:#6c757d; grid-column:span 3;" onclick="setRole('it')">💻 PANEL IT / WASIT</button>
        </div>
    </div>

    <!-- SCOREBOARD DISPLAY -->
    <div id="displayScreen" class="app-container hidden">
        <div class="top-bar">
            <span style="font-size:14px; font-weight:bold;">MATRAS: <span id="dispMatras">ARENA-1</span></span>
            <div class="timer-display">01:30</div>
            <button style="background:#444; color:#fff; padding:5px 10px;" onclick="location.reload()">Keluar</button>
        </div>
        <div class="main-grid">
            <div class="corner-box blue-corner">
                <h2>SUDUT BIRU</h2>
                <div class="score-num" id="scoreBlue">0</div>
                <div>
                    <div class="penalty-badge">Binaan: <span id="binaanBlue">0</span></div>
                    <div class="penalty-badge">Teguran: <span id="teguranBlue">0</span> (-<span id="minTegBlue">0</span>)</div>
                    <div class="penalty-badge">Peringatan: <span id="peringatanBlue">0</span> (-<span id="minPerBlue">0</span>)</div>
                </div>
            </div>
            <div class="corner-box red-corner">
                <h2>SUDUT MERAH</h2>
                <div class="score-num" id="scoreRed">0</div>
                <div>
                    <div class="penalty-badge">Binaan: <span id="binaanRed">0</span></div>
                    <div class="penalty-badge">Teguran: <span id="teguranRed">0</span> (-<span id="minTegRed">0</span>)</div>
                    <div class="penalty-badge">Peringatan: <span id="peringatanRed">0</span> (-<span id="minPerRed">0</span>)</div>
                </div>
            </div>
        </div>
    </div>

    <!-- PANEL JURI -->
    <div id="juriScreen" class="app-container hidden">
        <div class="top-bar">
            <span id="juriTitle" style="font-weight:bold; color:#ffc107;">PANEL JURI</span>
            <button style="background:#444; color:#fff; padding:4px 10px; font-size:12px;" onclick="location.reload()">Keluar</button>
        </div>
        <div class="main-grid">
            <div class="corner-box blue-corner">
                <h3 style="font-size:12px;">SUDUT BIRU</h3>
                <div class="btn-grid-juri">
                    <button class="btn-score" onclick="modifyScore('blue', 1)">+1 PUKULAN</button>
                    <button class="btn-score" onclick="modifyScore('blue', 2)">+2 TENDANGAN</button>
                    <button class="btn-score" style="grid-column: span 2; background:#17a2b8; color:#fff;" onclick="modifyScore('blue', 3)">+3 JATUHAN</button>
                    <button class="btn-deduct" style="grid-column: span 2;" onclick="modifyScore('blue', -1)">⚠️ RALAT (-1)</button>
                </div>
            </div>
            <div class="corner-box red-corner">
                <h3 style="font-size:12px;">SUDUT MERAH</h3>
                <div class="btn-grid-juri">
                    <button class="btn-score" onclick="modifyScore('red', 1)">+1 PUKULAN</button>
                    <button class="btn-score" onclick="modifyScore('red', 2)">+2 TENDANGAN</button>
                    <button class="btn-score" style="grid-column: span 2; background:#17a2b8; color:#fff;" onclick="modifyScore('red', 3)">+3 JATUHAN</button>
                    <button class="btn-deduct" style="grid-column: span 2;" onclick="modifyScore('red', -1)">⚠️ RALAT (-1)</button>
                </div>
            </div>
        </div>
    </div>

    <!-- PANEL IT -->
    <div id="itScreen" class="app-container hidden">
        <div class="top-bar">
            <span style="font-weight:bold; color:#ffc107;">PANEL IT / WASIT</span>
            <button style="background:#444; color:#fff; padding:4px 10px; font-size:12px;" onclick="location.reload()">Keluar</button>
        </div>
        <div class="main-grid">
            <div class="corner-box blue-corner" style="gap:5px;">
                <h3>PELANGGARAN BIRU</h3>
                <button class="btn-foul" onclick="modifyPenalty('blue', 'binaan')">+1 BINAAN</button>
                <button class="btn-foul" onclick="modifyPenalty('blue', 'teguran')">+1 TEGURAN (-1)</button>
                <button class="btn-foul" onclick="modifyPenalty('blue', 'peringatan')">+1 PERINGATAN (-5)</button>
            </div>
            <div class="corner-box red-corner" style="gap:5px;">
                <h3>PELANGGARAN MERAH</h3>
                <button class="btn-foul" onclick="modifyPenalty('red', 'binaan')">+1 BINAAN</button>
                <button class="btn-foul" onclick="modifyPenalty('red', 'teguran')">+1 TEGURAN (-1)</button>
                <button class="btn-foul" onclick="modifyPenalty('red', 'peringatan')">+1 PERINGATAN (-5)</button>
            </div>
        </div>
    </div>

    <script>
        // Konfigurasi Database Cloud Publik Gratis
        const firebaseConfig = {
            databaseURL: "https://silat-scoring-default-rtdb.firebaseio.com/"
        };
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();

        let matrasID = "ARENA-1";
        let currentRole = "";

        function setRole(role) {
            matrasID = document.getElementById('matrasCode').value.trim() || "ARENA-1";
            currentRole = role;
            document.getElementById('setupScreen').classList.add('hidden');

            if (role === 'display') {
                document.getElementById('displayScreen').classList.remove('hidden');
                document.getElementById('dispMatras').innerText = matrasID;
                listenCloudData();
            } else if (role.startsWith('juri')) {
                document.getElementById('juriScreen').classList.remove('hidden');
                document.getElementById('juriTitle').innerText = "PANEL " + role.toUpperCase();
            } else if (role === 'it') {
                document.getElementById('itScreen').classList.remove('hidden');
            }
        }

        function modifyScore(corner, pts) {
            let ref = db.ref('matches/' + matrasID);
            ref.transaction(currentData => {
                if (!currentData) {
                    currentData = { scoreBlue: 0, scoreRed: 0, binaanBlue: 0, binaanRed: 0, teguranBlue: 0, teguranRed: 0, peringatanBlue: 0, peringatanRed: 0 };
                }
                if (corner === 'blue') {
                    currentData.scoreBlue = Math.max(0, (currentData.scoreBlue || 0) + pts);
                } else {
                    currentData.scoreRed = Math.max(0, (currentData.scoreRed || 0) + pts);
                }
                return currentData;
            });
        }

        function modifyPenalty(corner, type) {
            let ref = db.ref('matches/' + matrasID);
            ref.transaction(currentData => {
                if (!currentData) {
                    currentData = { scoreBlue: 0, scoreRed: 0, binaanBlue: 0, binaanRed: 0, teguranBlue: 0, teguranRed: 0, peringatanBlue: 0, peringatanRed: 0 };
                }
                if (type === 'binaan') {
                    if (corner === 'blue') currentData.binaanBlue = (currentData.binaanBlue || 0) + 1;
                    else currentData.binaanRed = (currentData.binaanRed || 0) + 1;
                } else if (type === 'teguran') {
                    if (corner === 'blue') {
                        currentData.teguranBlue = (currentData.teguranBlue || 0) + 1;
                        currentData.scoreBlue = Math.max(0, currentData.scoreBlue - 1);
                    } else {
                        currentData.teguranRed = (currentData.teguranRed || 0) + 1;
                        currentData.scoreRed = Math.max(0, currentData.scoreRed - 1);
                    }
                } else if (type === 'peringatan') {
                    if (corner === 'blue') {
                        currentData.peringatanBlue = (currentData.peringatanBlue || 0) + 1;
                        currentData.scoreBlue = Math.max(0, currentData.scoreBlue - 5);
                    } else {
                        currentData.peringatanRed = (currentData.peringatanRed || 0) + 1;
                        currentData.scoreRed = Math.max(0, currentData.scoreRed - 5);
                    }
                }
                return currentData;
            });
        }

        function listenCloudData() {
            db.ref('matches/' + matrasID).on('value', (snapshot) => {
                let data = snapshot.val();
                if (data) {
                    document.getElementById('scoreBlue').innerText = data.scoreBlue || 0;
                    document.getElementById('scoreRed').innerText = data.scoreRed || 0;
                    document.getElementById('binaanBlue').innerText = data.binaanBlue || 0;
                    document.getElementById('binaanRed').innerText = data.binaanRed || 0;
                    document.getElementById('teguranBlue').innerText = data.teguranBlue || 0;
                    document.getElementById('teguranRed').innerText = data.teguranRed || 0;
                    document.getElementById('peringatanBlue').innerText = data.peringatanBlue || 0;
                    document.getElementById('peringatanRed').innerText = data.peringatanRed || 0;

                    document.getElementById('minTegBlue').innerText = (data.teguranBlue || 0) * 1;
                    document.getElementById('minTegRed').innerText = (data.teguranRed || 0) * 1;
                    document.getElementById('minPerBlue').innerText = (data.peringatanBlue || 0) * 5;
                    document.getElementById('minPerRed').innerText = (data.peringatanRed || 0) * 5;
                }
            });
        }
    </script>
</body>
</html>
