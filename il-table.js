(function() {
    "use strict";

    const TRIGGER_KEYS = ["Enter", "Tab"];

    function dynamicSort(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    function dynamicSortMultiple() {
        /*
         * save the arguments object as it will be overwritten
         * note that arguments object is an array-like object
         * consisting of the names of the properties to sort by
         */
        var props = arguments;
        return function (obj1, obj2) {
            var i = 0, result = 0, numberOfProperties = props.length;
            /* try getting a different result from 0 (equal)
             * as long as we have extra properties to compare
             */
            while(result === 0 && i < numberOfProperties) {
                result = dynamicSort(props[i])(obj1, obj2);
                i++;
            }
            return result;
        }
    }
    

    var books = [
        {
            "title": "Germinal",
            "author": "Emile ZOLA"
        },
        {
            "title": "La curée",
            "author": "Emile ZOLA"
        },
        {
            "title": "Le ventre de Paris",
            "author": "Emile ZOLA"
        },
        {
            "title": "Nana",
            "author": "Emile ZOLA"
        },
        {
            "title": "L'assomoir",
            "author": "Alexis G"
        },
        {
            "title": "La Fortune des Rougon",
            "author": "Emile ZOLA"
        },
        {
            "title": "L'Oeuvre",
            "author": "Emile ZOLA"
        },
        {
            "title": "La joie de vivre",
            "author": "Emile ZOLA"
        },
        {
            "title": "Au Bonheur des Dames",
            "author": "Emile ZOLA"
        },
        {
            "title": "La Terre",
            "author": "Emile ZOLA"
        },
        {
            "title": "La Bête humaine",
            "author": "Emile ZOLA"
        },
        {
            "title": "Le Rêve",
            "author": "Emile ZOLA"
        },
        {
            "title": "L'Argent",
            "author": "Emile ZOLA"
        },
        {
            "title": "La Débâcle",
            "author": "Emile ZOLA"
        },
        {
            "title": "Pot-Bouille",
            "author": "Emile ZOLA"
        },
        {
            "title": "Une page d'amour",
            "author": "Emile ZOLA"
        },
        {
            "title": "La Conquête de Plassans",
            "author": 1
        },
        {
            "title": "Germinal",
            "author": "Emile ZOLA"
        },
        {
            "title": "Son Excellence Eugène Rougon",
            "author": "Emile ZOLA",
            "test": 3
        },
        {
            "title": "Son Excellence Eugène Rougon",
            "author": "Emile ZOLA"
        },
        {
            "test": 3,
            "title": "Le Docteur Pascal",
            "author": ["Emile ZOLA","Test"]
        }
    ];

    var HttpClient = function() {
        this.get = function(aUrl, aCallback) {
            var anHttpRequest = new XMLHttpRequest();
            anHttpRequest.onreadystatechange = function() { 
                if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                    aCallback(anHttpRequest.responseText);
            }
    
            anHttpRequest.open( "GET", aUrl, true );            
            anHttpRequest.send( null );
        }
    }

    var template = document.createElement("template");
    template.innerHTML  = `
        
        <style>
        .badge {
            display: inline-block;
            min-width: 1.5em; /* em unit */
            padding: .3em; /* em unit */
            border-radius: 100%;
            font-size: 14px;
            text-align: center;
            color: #fefefe;
        }
        .string {
            background: #1779ba;
        }
        .number {
            background: #a2ade8;
        }
        .undefined {
            background: #a3101f;
        }
        .object {
            background: #137847;
        }
        .boolean {
            min-height: 1.5em;
            margin-bottom: 0px;
            background: #b35a27;
        }
        .labels {
            background-color: #D3D3D3;
            /*width: 100%-4rem;*/
            padding: 2rem;
            box-shadow: 0 1.5rem 1rem -1rem rgba(0, 0, 0, .1);
            border-radius: .3rem;
        }
        </style>
        <div class="labels">
            <span class="badge string">a-Z</span> <span>String</span>
            <span class="badge number">0-9</span> <span>Number</span>
            <span class="badge object">{ }</span> <span>Object/span>
            <span class="badge undefined">NaN</span> <span>Undefined</span>
            <span class="badge boolean"> </span> <span>Boolean</span>
        </div>
        <table>
            <thead>
            </thead>
            <tbody>
            </tbody>
        </table>
    `
    class TableList extends HTMLElement{
        constructor() {
            super();

            this._shadow = this.attachShadow({ mode: "open"});
            this._shadow.appendChild(template.content.cloneNode(true))

            this._items = books;
            this._tableHead = this._shadow.querySelector("thead");
            this._tableBody = this._shadow.querySelector("tbody");
            
            this._columns = [];
            this._rows = [];


        }

        connectedCallback() {
            this.initTable();
            this._sortButton.forEach((btn) => {
                btn.addEventListener("click", this.handleSort)
            })
            this._filterButton.forEach((btn) => {
                btn.addEventListener("click", this.handleFilter)
            })
            this._filterInput.forEach((btn) => {
                btn.addEventListener("keydown", this.handleSearch)
            })
        }

        disconnectedCallback() {
            this._tableBody.innerHTML = "";
            this._tableHead.innerHTML = "";
            this._sortButton.forEach((btn) => {
                btn.removeEventListener("click", this.handleSort);
            })
            this._filterButton.forEach((btn) => {
                btn.removeEventListener("click", this.handleFilter)
            })
            this._filterInput.forEach((btn) => {
                btn.removeEventListener("keydown", this.handleSearch)
            })
        }

        handleSearch = (evt) => {
            if (TRIGGER_KEYS.includes(evt.key)) {
                evt.preventDefault();
                this._tableHead.querySelectorAll("input").forEach(input => {
                    if (input.parentNode.getAttribute("data-key") != evt.target.parentNode.getAttribute("data-key")) {
                        input.value =""; 
                        input.setAttribute("hidden",true);
                    }
                        
                })
                var value = evt.target.value.trim();
                //this.update()
                var key = evt.target.parentNode.getAttribute("data-key")
                this._tableBody.querySelectorAll(`td[data-header="${key}"]`).forEach(td => {td.lastChild.innerHTML.toLowerCase().includes(value.toLowerCase()) ? td.parentNode.removeAttribute("hidden") : td.parentNode.setAttribute("hidden",true)})
            }
        }

        handleSort = (evt) => {
            var key = evt.target.parentNode.getAttribute("data-key")
            var order = evt.target.getAttribute("data-order")
            order == "-1" ? this._rows.sort(dynamicSort("-"+key)) : this._rows.sort(dynamicSort(key))
            this.update()
        }

        handleFilter = (evt) => {
            this._tableHead.querySelectorAll("input").forEach(input => {
                if (input.parentNode.getAttribute("data-key") != evt.target.parentNode.getAttribute("data-key")) {
                    input.value =""; 
                    input.setAttribute("hidden",true);
                }      
            })
            if(evt.target.parentNode.lastChild.getAttribute("hidden") != null){
                evt.target.parentNode.lastChild.removeAttribute("hidden")
            }
            else{
                evt.target.parentNode.lastChild.setAttribute("hidden",true)
                this.update()
            }
                
                     
        }

        getData() {
            const xhr = new XMLHttpRequest()
            try {
                xhr.open("get", "books.json", false)
                xhr.send()
                return xhr.responseText
            } catch (err) {
                return ""
            }
        }

        isInColumns(column) {
            return this._columns.includes(column);
        }

        getLibBadge(type){
            switch(type) {
                case 'string': 
                    type = "a-Z"
                    break
                case 'number':
                    type = "0-9"
                    break
                case 'undefined':
                    type = "NaN"
                    break
                case 'object':
                    type = "{ }"
                    break
                case 'boolean':
                    type = " "
                    break
            }
            return type
        }

        update() {

            this._tableBody.innerHTML = ""
            

            this._rows.forEach((row) => {
                var toInsert = `<tr id="tr_${row['id']}">`
                this._columns.forEach((column) => {
                    if(row.hasOwnProperty(column) && row[column] != null) {
                        toInsert +=  `<td data-header="${column}" data-type="${typeof row[column]}"><span class="badge ${typeof row[column]}">${this.getLibBadge(typeof row[column])}</span> <span>${row[column]}</span></td>`
                    }
                    else {
                        row[column] = null
                        toInsert += `<td></td>`
                    }
                })
                toInsert += `</tr>`
                this._tableBody.insertAdjacentHTML("beforeend",toInsert);
            });
           
            localStorage.setItem('data',this._rows)
            
            //console.log(this._rows.sort(dynamicSortMultiple("author","id")))
        }

        getButtons(){
            return ` <button type="button" class="sort" data-order="1">Sort 1</button><button type="button" class="sort" data-order="-1">Sort -1</button><button type="button" class="filter">Filter</button><input type="text" class="search" hidden/>`
        }

        initTable() {

            
            
          books.forEach((item,idx) => {
              var row = Object()
              row["id"] = idx;
              var i = 0
              for(const [key,value] of Object.entries(item)) {
                if(!this.isInColumns(key)){
                    this._columns.push(key);
                }
                row[key] = value;
                i++
              }
              this._rows.push(row);
          });
          this._tableHead.innerHTML = ""

            var header = `<tr>`;
            this._columns.forEach((item) => {
            header += `<th data-key="${item}">${item} ${this.getButtons()}</th>`
            });
            header += `</tr>`;
            this._tableHead.insertAdjacentHTML("beforeend",header);

            this._sortButton = this._shadow.querySelectorAll(".sort");
            this._filterButton = this._shadow.querySelectorAll(".filter");
            this._filterInput = this._shadow.querySelectorAll(".search");
            console.log(this._sortButton)
          this.update()
        }
    }
    customElements.define("il-table", TableList);
}) ();