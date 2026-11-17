(function () {
    var current = "0";      // number being typed / shown
    var prev = null;        // stored first operand
    var op = null;          // pending operator
    var justEvaluated = false;
    var fresh = false;      // true right after pressing an operator

    var resultEl = document.getElementById("result");
    var exprEl = document.getElementById("expr");

    function compute(a, b, o) {
        a = parseFloat(a);
        b = parseFloat(b);
        var r;
        switch (o) {
            case "+": r = a + b; break;
            case "−": r = a - b; break;
            case "×": r = a * b; break;
            case "÷":
                if (b === 0) return "Error";
                r = a / b;
                break;
        }
        return String(parseFloat(r.toPrecision(12)));
    }

    function fmt(s) {
        if (s === "Error") return s;
        var neg = s[0] === "-";
        if (neg) s = s.slice(1);
        var p = s.split(".");
        var i = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return (neg ? "-" : "") + i + (p.length > 1 ? "." + p[1] : "");
    }

    function render() {
        resultEl.textContent = fmt(current);
        var len = resultEl.textContent.length;
        resultEl.style.fontSize = len > 14 ? "1.4rem" : len > 10 ? "1.9rem" : "2.6rem";
        exprEl.textContent = op ? fmt(prev) + " " + op : "";
    }

    function clearAll() {
        current = "0"; prev = null; op = null;
        justEvaluated = false; fresh = false;
    }

    function num(d) {
        if (current === "Error") clearAll();
        if (fresh || justEvaluated) { current = "0"; fresh = false; justEvaluated = false; }
        if (current.replace(/[-.]/g, "").length >= 15) return;
        current = current === "0" ? d : current + d;
    }

    function dot() {
        if (current === "Error") clearAll();
        if (fresh || justEvaluated) { current = "0"; fresh = false; justEvaluated = false; }
        if (current.indexOf(".") === -1) current += ".";
    }

    function setOp(o) {
        if (current === "Error") return;
        if (op && !fresh) {
            current = compute(prev, current, op);
            if (current === "Error") { op = null; prev = null; return; }
        }
        prev = current;
        op = o;
        fresh = true;
        justEvaluated = false;
    }

    function equals() {
        if (!op || current === "Error") return false;
        var expr = fmt(prev) + " " + op + " " + fmt(current) + " =";
        current = compute(prev, current, op);
        prev = null; op = null;
        justEvaluated = true; fresh = false;
        render();
        exprEl.textContent = expr;
        return true; // keep the finished expression visible
    }

    function percent() {
        if (current !== "Error") {
            current = String(parseFloat((parseFloat(current) / 100).toPrecision(12)));
        }
    }

    function back() {
        if (justEvaluated || fresh || current === "Error") return;
        current = current.length > 1 && !(current.length === 2 && current[0] === "-")
            ? current.slice(0, -1)
            : "0";
    } 

    // Mouse / touch
    document.getElementById("keys").addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        var kept = false;
        if (b.dataset.num !== undefined) num(b.dataset.num);
        else if (b.dataset.op) setOp(b.dataset.op);
        else switch (b.dataset.act) {
            case "clear": clearAll(); break;
            case "dot": dot(); break;
            case "del": back(); break;
            case "percent": percent(); break;
            case "equals": kept = equals(); break;
        }
        if (!kept) render();
    });

    // Keyboard
    document.addEventListener("keydown", function (e) {
        var k = e.key, kept = false;
        if (/^[0-9]$/.test(k)) num(k);
        else if (k === ".") dot();
        else if (k === "+") setOp("+");
        else if (k === "-") setOp("−");
        else if (k === "*" || k === "x") setOp("×");
        else if (k === "/") { e.preventDefault(); setOp("÷"); }
        else if (k === "%") percent();
        else if (k === "Enter" || k === "=") { e.preventDefault(); kept = equals(); }
        else if (k === "Backspace") back();
        else if (k === "Escape" || k === "Delete") clearAll();
        else return;
        if (!kept) render();
    });

    render();
})();