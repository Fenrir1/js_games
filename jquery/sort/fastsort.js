function fastSortEngine(id) {
    // �������� ������ �������
    var tableObj = document.getElementById(id);
    this.months = { 'jan': 0, 'feb': 1,  'mar': 2,
                    'apr': 3, 'may': 4,  'jun': 5,
                    'jul': 6, 'aug': 7,  'sep': 8,
                    'oct': 9, 'nov': 10, 'dec': 11};
    this.nullValue = -1000000; // �����, ����� �������� ������ �������� � ����� ����
    var theader = tableObj.tHead.rows[0];
    // ���� �������
    this.tBody = tableObj.tBodies[0];
    // ����� �����
    this.rowsLen = this.tBody.childNodes.length;
    var t = this;
    var colLen = theader.childNodes.length;
    this.cache = new Array();
    // ����������� �������, ����� ����� ����� �� �����������������
    for(var i=0; i<colLen; i++) {
        this.getUniqueID(theader.childNodes[i], i);
    }
    // ����������� ������, ����� ��������� �� ��� ����������
    for(var i=0; i<this.rowsLen; i++) {
        this.getUniqueID(this.tBody.childNodes[i], i);
    }
    // ����� ����������� ����� �� ��������� �������
    theader.onclick = function(e) {
        e = e ? e : event; // ��� FF
        var target = e.target ? e.target : e.srcElement;
        return t.handleRowClick(target);
    }
}
// ���������� �����
fastSortEngine.prototype.handleRowClick = function (target) {
    if(this.sortStarted || target.type=='skip') { return false; } // �� ��������� ����������, ���� ���������� �� ���������
    this.sortStarted = true;

    if(target.tagName == "TH") {
        this.target = target;
        // ������ ������ (����������� ����������)
        var cstatus = (!this.target.selected || this.target.selected == 2) ? 1 : 2;
        this.colType = this.target.getAttribute("type"); // ��� ������� ����� �� ��������
        this.colID = this.target.runiqueID; // ������������� (���������� �����) �������
         // ������ css class ��� ����������� ������
        if(this.prevTarget && this.target != this.prevTarget) {
            this.markRow(this.prevTarget, 0);
        }
        // ���� ����������
        this.processSort(cstatus);
        this.prevTarget = this.target;
        this.markRow(this.target, cstatus);
    }
    this.sortStarted = false;
    return true;
}
// ������� ��� ����� css ������
fastSortEngine.prototype.markRow = function (obj, status) {
    obj.selected = status;
    if(status == 1) {
        obj.className = "theaderup";
    } else if(status == 2) {
        obj.className = "theaderdown";
    } else {
        obj.className = "theader";
    }
}
fastSortEngine.prototype.processSort = function (status) {
    if(this.rowsLen > 1) {
        // ������, � ������� ����� ���������� �������� �����
        var dataCol = new Array();
        if(!this.cache[this.colID]) {
            // ��� ���� ����� �������
            var val = false;
            for(var i = 0; i<this.rowsLen; i++) {
                var rowObj = this.tBody.childNodes[i];
                if(!rowObj.tagName) continue; // ���������� ��������� ���� (FF)
                var colObj = rowObj.childNodes[this.colID];
                val = colObj.innerText ? colObj.innerText : colObj.textContent; // ����� ������ (FF)
                // �������� ��� �������� � ������� ����
                switch(this.colType) {
                    case "dattime": // ������ �����
                        val = this.parseTime(val);
                        break;
                    case "dat": // ������ ����
                        val = this.parseDate(val);
                        break;
                    case "interval": // ������ ��������
                        val = this.parseInterval(val);
                        break;
                }
                if(this.colType != "text") val = val == '' ? this.nullValue : parseFloat(val);
                // �������� � ������ ��������, ������������� ������ � ���� ������, ����� ����� ������������ ������ � �������
                var obj = [val,
                           rowObj.runiqueID,
                           rowObj];
                dataCol.push(obj);
            }
            this.cache[this.colID] = dataCol;
        } else {
            dataCol = this.cache[this.colID];
        }
        // ��� ���������� ����������� �������� ������� ������� ����������, ��� ������ ����� � ������������
        if(this.colType == "text") dataCol.sort();
        else dataCol.sort(this.sortNumber);
        // ���� ����� �������� ����������
        if( status == 2 ) {
            dataCol.reverse();
        }
        // ��������������� ������ � ������� � ������ (���������������) �������
        var l = dataCol.length;
        for(var i = 0; i<l; i++) {
            this.tBody.appendChild(dataCol[i][2]);
        }
    }
}
// ������ �������
fastSortEngine.prototype.getUniqueID = function(robj, pos) {
    if(!robj.runiqueID) {
        robj.runiqueID = pos;
    }
    return robj.runiqueID;
}
// ������� ��� ������� ������, ���������� �����
fastSortEngine.prototype.parseTime = function(tvalue) {
    var ret = tvalue;
    if(!tvalue) {
        ret = this.nullValue;
    } else {
        ret = parseFloat(tvalue.substr(6,2)+tvalue.substr(3,2)+tvalue.substr(0,2)+'.'+tvalue.substr(9,2)+tvalue.substr(12,2));
    }
    return ret;
}
// ������� ��� ������� ������, ���������� ����
fastSortEngine.prototype.parseDate = function(dvalue) {
    var ret = dvalue;
    if(!dvalue) {
        ret = this.nullValue;
    } else {
        ret = parseInt(dvalue.substr(6,4)+dvalue.substr(3,2)+dvalue.substr(0,2));
    }
    return ret;
}
fastSortEngine.prototype.parseInterval = function(dvalue) {
    var ret = dvalue;
    if(!dvalue) {
        ret = this.nullValue;
    } else {
		var res = dvalue.match(/(\d{0,2})�* *(\d\d)�/);
		ret = (Number(res[1])+Number(res[2])/60).toFixed(3);
    }
    return ret;
}
// ���������� ��� ���������� �� �������� ���������
fastSortEngine.prototype.sortNumber = function(a,b) {
    // ���������� ��� �������� � ���� ��� �����, �� ��������� �� ������� (ID)
    if     (a[0] == b[0] && a[1] < b[1] ) return -0.0000000001;
    else if(a[0] == b[0] && a[1] > b[1] ) return  0.0000000001;
    // ��������� ���
    return a[0] - b[0];
}