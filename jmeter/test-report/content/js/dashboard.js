/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 0.0, "KoPercent": 100.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Get User Profile"], "isController": false}, {"data": [0.0, 500, 1500, "Login (Get Token)"], "isController": false}, {"data": [0.0, 500, 1500, "Get Formation by ID"], "isController": false}, {"data": [0.0, 500, 1500, "Signup API"], "isController": false}, {"data": [0.0, 500, 1500, "Get All Formations"], "isController": false}, {"data": [0.0, 500, 1500, "Login API"], "isController": false}, {"data": [0.0, 500, 1500, "Get Courses"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 510, 510, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 54.43483829650977, 63.51200184784929, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get User Profile", 100, 100, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 10.711225364181661, 12.489456137532134, 0.0], "isController": false}, {"data": ["Login (Get Token)", 100, 100, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 10.673497705197992, 12.424618422457039, 0.0], "isController": false}, {"data": ["Get Formation by ID", 100, 100, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 23.089355806972986, 27.215676229508194, 0.0], "isController": false}, {"data": ["Signup API", 5, 5, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 8.143322475570033, 9.48728878257329, 0.0], "isController": false}, {"data": ["Get All Formations", 100, 100, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 22.9147571035747, 26.674209440879928, 0.0], "isController": false}, {"data": ["Login API", 5, 5, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 7.739938080495356, 9.009771671826625, 0.0], "isController": false}, {"data": ["Get Courses", 100, 100, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 10.711225364181661, 12.43715523243359, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/courses", 100, 19.607843137254903, 19.607843137254903], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/user/profile", 100, 19.607843137254903, 19.607843137254903], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/formations", 100, 19.607843137254903, 19.607843137254903], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/auth/login", 105, 20.58823529411765, 20.58823529411765], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/formations/${formationId}", 100, 19.607843137254903, 19.607843137254903], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/auth/signup", 5, 0.9803921568627451, 0.9803921568627451], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 510, 510, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/auth/login", 105, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/courses", 100, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/user/profile", 100, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/formations", 100, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/formations/${formationId}", 100], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get User Profile", 100, 100, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/user/profile", 100, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Login (Get Token)", 100, 100, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/auth/login", 100, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Formation by ID", 100, 100, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/formations/${formationId}", 100, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Signup API", 5, 5, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/auth/signup", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get All Formations", 100, 100, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/formations", 100, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Login API", 5, 5, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/auth/login", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Courses", 100, 100, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http://${BASE_URL}/api/courses", 100, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
