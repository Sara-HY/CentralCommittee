var table = {
    initialize: function(name){
        var self = this;

        $("#name").html(name)
        var filePath = "./data/" + name + ".csv";

        d3.csv(filePath,function(error,csvdata){
            if(error){  
                console.log(error);  
            }  
            var table = $("#table");

            self.dataTable = table.DataTable({
                data: csvdata,
                info: false,
                lengthchange: false,
                paging: false,
                bSortClasses: false,
                searching: false,
                aoColumns: [
                    {data: "time", title: "日期"},
                    {data: "position", title: "履历"}
                ]
            }) 
        });
    },

    update: function(name){
        var self = this;
        $("#name").html(name)
        var filePath = "./data/" + name + ".csv";

        d3.csv(filePath,function(error,csvdata){
            if(error){  
                console.log(error);  
            }  
            self.dataTable.clear();
            self.dataTable.rows.add(csvdata);
            self.dataTable.draw();  
        });
    }
}

