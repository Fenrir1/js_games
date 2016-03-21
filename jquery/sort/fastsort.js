function fastSortEngine(id) {
    // получаем объект таблицы
    var tableObj = document.getElementById(id);
    this.months = { 'jan': 0, 'feb': 1,  'mar': 2,
                    'apr': 3, 'may': 4,  'jun': 5,
                    'jul': 6, 'aug': 7,  'sep': 8,
                    'oct': 9, 'nov': 10, 'dec': 11};
    this.nullValue = -1000000; // нужно, чтобы помещать пустые значени€ в самый верх
    var theader = tableObj.tHead.rows[0];
    // тело таблицы
    this.tBody = tableObj.tBodies[0];
    // число строк
    this.rowsLen = this.tBody.childNodes.length;
    var t = this;
    var colLen = theader.childNodes.length;
    this.cache = new Array();
    // индексируем столбцы, чтобы позже легко их индектифицировать
    for(var i=0; i<colLen; i++) {
        this.getUniqueID(theader.childNodes[i], i);
    }
    // индексируем строки, чтобы учитывать их при сортировке
    for(var i=0; i<this.rowsLen; i++) {
        this.getUniqueID(this.tBody.childNodes[i], i);
    }
    // вызов обработчика клика по заголовку таблицы
    theader.onclick = function(e) {
        e = e ? e : event; // дл€ FF
        var target = e.target ? e.target : e.srcElement;
        return t.handleRowClick(target);
    }
}
// обработчик клика
fastSortEngine.prototype.handleRowClick = function (target) {
    if(this.sortStarted || target.type=='skip') { return false; } // не запускать сортировку, пока предыдуща€ не закончена
    this.sortStarted = true;

    if(target.tagName == "TH") {
        this.target = target;
        // мен€ем статус (направление сортировки)
        var cstatus = (!this.target.selected || this.target.selected == 2) ? 1 : 2;
        this.colType = this.target.getAttribute("type"); // тип колонки берем из атрибута
        this.colID = this.target.runiqueID; // идентификатор (пор€дковый номер) колонки
         // мен€ем css class дл€ предыдущего выбора
        if(this.prevTarget && this.target != this.prevTarget) {
            this.markRow(this.prevTarget, 0);
        }
        // сама сортировка
        this.processSort(cstatus);
        this.prevTarget = this.target;
        this.markRow(this.target, cstatus);
    }
    this.sortStarted = false;
    return true;
}
// функци€ дл€ смены css класса
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
        // массив, в который будем записывать значени€ €чеек
        var dataCol = new Array();
        if(!this.cache[this.colID]) {
            // дл€ всех строк таблицы
            var val = false;
            for(var i = 0; i<this.rowsLen; i++) {
                var rowObj = this.tBody.childNodes[i];
                if(!rowObj.tagName) continue; // пропускаем текстовые ноды (FF)
                var colObj = rowObj.childNodes[this.colID];
                val = colObj.innerText ? colObj.innerText : colObj.textContent; // текст €чейки (FF)
                // приводим все значени€ к нужному типу
                switch(this.colType) {
                    case "dattime": // парсим врем€
                        val = this.parseTime(val);
                        break;
                    case "dat": // парсим дату
                        val = this.parseDate(val);
                        break;
                    case "interval": // парсим интервал
                        val = this.parseInterval(val);
                        break;
                }
                if(this.colType != "text") val = val == '' ? this.nullValue : parseFloat(val);
                // помен€ем в объект значение, идектификатор строки и ноду строки, чтобы потом восстановить строку в таблицу
                var obj = [val,
                           rowObj.runiqueID,
                           rowObj];
                dataCol.push(obj);
            }
            this.cache[this.colID] = dataCol;
        } else {
            dataCol = this.cache[this.colID];
        }
        // дл€ текстового содержимого вызываем обычную функцию сортировки, дл€ других типов с обработчиком
        if(this.colType == "text") dataCol.sort();
        else dataCol.sort(this.sortNumber);
        // если нужна обратна€ сортировка
        if( status == 2 ) {
            dataCol.reverse();
        }
        // восстанавливаем строки в таблицу в нужном (отсортированном) пор€дке
        var l = dataCol.length;
        for(var i = 0; i<l; i++) {
            this.tBody.appendChild(dataCol[i][2]);
        }
    }
}
// индекс объекта
fastSortEngine.prototype.getUniqueID = function(robj, pos) {
    if(!robj.runiqueID) {
        robj.runiqueID = pos;
    }
    return robj.runiqueID;
}
// функци€ дл€ разбора строки, содержащей врем€
fastSortEngine.prototype.parseTime = function(tvalue) {
    var ret = tvalue;
    if(!tvalue) {
        ret = this.nullValue;
    } else {
        ret = parseFloat(tvalue.substr(6,2)+tvalue.substr(3,2)+tvalue.substr(0,2)+'.'+tvalue.substr(9,2)+tvalue.substr(12,2));
    }
    return ret;
}
// функци€ дл€ разбора строки, содержащей дату
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
		var res = dvalue.match(/(\d{0,2})ч* *(\d\d)м/);
		ret = (Number(res[1])+Number(res[2])/60).toFixed(3);
    }
    return ret;
}
// обработчик дл€ сортировки по числовым значени€м
fastSortEngine.prototype.sortNumber = function(a,b) {
    // сравниваем два значени€ и если они равны, то сортируем по индексу (ID)
    if     (a[0] == b[0] && a[1] < b[1] ) return -0.0000000001;
    else if(a[0] == b[0] && a[1] > b[1] ) return  0.0000000001;
    // вычисл€ем вес
    return a[0] - b[0];
}