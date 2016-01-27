define("OrderSectionV2", [], function() {
    return {
        entitySchemaName: "Order",
        attributes: {},
        methods: {
            getSectionActions: function() {
                var actionMenuItems = this.callParent(arguments),
                    PrintFormItems = this.Ext.create("Terrasoft.BaseViewModelCollection"),
                    PrintForm = this.getButtonMenuItem({
                        Caption: "Бланки",
                        Items: PrintFormItems
                    });
                PrintFormItems.addItem(this.getButtonMenuItem({
                    Caption: "Почтовый перевод",
                    Click: {"bindTo": "printFirstBlank"},
                    "Enabled": true
                }));
                PrintFormItems.addItem(this.getButtonMenuItem({
                    Caption: "Опись",
                    Click: {"bindTo": "printSecondBlank"},
                    "Enabled": true
                }));
                PrintFormItems.addItem(this.getButtonMenuItem({
                    Caption: "Накладная ф.16",
                    Click: {"bindTo": "printThirdBlank"},
                    "Enabled": true
                }));
                var importButton = this.getButtonMenuItem({
                    Caption: "Импорт",
                    Click: {"bindTo": "import"},
                    "Enabled": true
                });
                actionMenuItems.addItem(PrintForm);
                actionMenuItems.addItem(importButton);
                return actionMenuItems;
            },
            import: function(){
                var url = this.Terrasoft.workspaceBaseUrl + "/ViewPage.aspx?Id=ec323cf0-8201-4519-b50f-469b8ac34b78";
                window.open(url, "_blank", "height=300,width=500");
            },
            printFirstBlank: function(){
                this.showBodyMask();
                var filters = this.getReportFilters();
                var reportParameters;
                if (filters instanceof Terrasoft.FilterGroup) {
                    reportParameters = {Filters: filters.serialize()};
                } else {
                    reportParameters = filters;
                }
                var selectedRows = this.getPrimaryColumnValue() || this.getSelectedItems() ||
                    Terrasoft.GUID_EMPTY;

                var data = {
                    reportParameters: Ext.JSON.encode(reportParameters),
                    reportSchemaUId: "e78d01b9-606b-43e1-8f90-acfa91a8b110",
                    templateId: "",
                    recordId: "",

                    entitySchemaUId: this.getEntitySchemaUId(), //TODO !!!!!!!!!!

                    caption: "Бланк№1.pdf",
                    convertInPDF: false
                };

                var serviceConfig = {
                    serviceName: "ReportService",
                    methodName: "CreateReport",
                    data: data,
                    timeout: 20 * 60 * 1000
                };
                var callback = this.Terrasoft.emptyFn;
                if (Ext.isArray(selectedRows) && selectedRows.length > 1) {
                    delete data.recordId;
                    data.recordIds = selectedRows;
                    serviceConfig.methodName = "CreateReportsList";
                    callback = function(response) {
                        var keys = response.CreateReportsListResult;
                        for (var i = 0; i < keys.length; i++) {
                            this.downloadReport("capt", keys[i]);
                        }
                    };
                } else {
                    callback = function(response) {
                        var key = response.CreateReportResult;
                        this.downloadReport("capt", key);
                    };
                }
                this.callService(serviceConfig, function(response) {
                    this.hideBodyMask();
                    callback.call(this, response);
                }, this);
            },
            printSecondBlank: function(){
                this.showBodyMask();
                var filters = this.getReportFilters();
                var reportParameters;
                if (filters instanceof Terrasoft.FilterGroup) {
                    reportParameters = {Filters: filters.serialize()};
                } else {
                    reportParameters = filters;
                }
                var selectedRows = this.getPrimaryColumnValue() || this.getSelectedItems() ||
                    Terrasoft.GUID_EMPTY;

                var data = {
                    reportParameters: Ext.JSON.encode(reportParameters),
                    reportSchemaUId: "97be8370-eea4-41c9-bf0a-a7c9d0deeab3",
                    templateId: "",
                    recordId: "",

                    entitySchemaUId: this.getEntitySchemaUId(), //TODO !!!!!!!!!!

                    caption: "Бланк№2.pdf",
                    convertInPDF: false
                };

                var serviceConfig = {
                    serviceName: "ReportService",
                    methodName: "CreateReport",
                    data: data,
                    timeout: 20 * 60 * 1000
                };
                var callback = this.Terrasoft.emptyFn;
                if (Ext.isArray(selectedRows) && selectedRows.length > 1) {
                    delete data.recordId;
                    data.recordIds = selectedRows;
                    serviceConfig.methodName = "CreateReportsList";
                    callback = function(response) {
                        var keys = response.CreateReportsListResult;
                        for (var i = 0; i < keys.length; i++) {
                            this.downloadReport("capt", keys[i]);
                        }
                    };
                } else {
                    callback = function(response) {
                        var key = response.CreateReportResult;
                        this.downloadReport("capt", key);
                    };
                }
                this.callService(serviceConfig, function(response) {
                    this.hideBodyMask();
                    callback.call(this, response);
                }, this);
            },
            printThirdBlank: function(){
                this.showBodyMask();
                var filters = this.getReportFilters();
                var reportParameters;
                if (filters instanceof Terrasoft.FilterGroup) {
                    reportParameters = {Filters: filters.serialize()};
                } else {
                    reportParameters = filters;
                }
                var selectedRows = this.getPrimaryColumnValue() || this.getSelectedItems() ||
                    Terrasoft.GUID_EMPTY;

                var data = {
                    reportParameters: Ext.JSON.encode(reportParameters),
                    reportSchemaUId: "01c2dd64-ffb4-4bb7-9137-85493b915c6d",
                    templateId: "",
                    recordId: "",

                    entitySchemaUId: this.getEntitySchemaUId(), //TODO !!!!!!!!!!

                    caption: "Бланк№3.pdf",
                    convertInPDF: false
                };

                var serviceConfig = {
                    serviceName: "ReportService",
                    methodName: "CreateReport",
                    data: data,
                    timeout: 20 * 60 * 1000
                };
                var callback = this.Terrasoft.emptyFn;
                if (Ext.isArray(selectedRows) && selectedRows.length > 1) {
                    delete data.recordId;
                    data.recordIds = selectedRows;
                    serviceConfig.methodName = "CreateReportsList";
                    callback = function(response) {
                        var keys = response.CreateReportsListResult;
                        for (var i = 0; i < keys.length; i++) {
                            this.downloadReport("capt", keys[i]);
                        }
                    };
                } else {
                    callback = function(response) {
                        var key = response.CreateReportResult;
                        this.downloadReport("capt", key);
                    };
                }
                this.callService(serviceConfig, function(response) {
                    this.hideBodyMask();
                    callback.call(this, response);
                }, this);
            },
            downloadReport: function(caption, key) {
                var report = document.createElement("a");
                report.href = "../rest/ReportService/GetReportFile/" + key;
                report.download = caption;
                document.body.appendChild(report);
                report.click();
                document.body.removeChild(report);
            },
            initFixedFiltersConfig: function () {
                var fixedFilterConfig = {
                    entitySchema: this.entitySchema,
                    filters: [
                        {
                            name: "PeriodFilter",
                            caption: this.get("Resources.Strings.PeriodFilterCaption"),
                            dataValueType: this.Terrasoft.DataValueType.DATE,
                            startDate: {
                                columnName: "Date",
                                defValue: this.Terrasoft.startOfWeek(new Date())
                            },
                            dueDate: {
                                columnName: "Date",
                                defValue: this.Terrasoft.endOfWeek(new Date())
                            }
                        }
                    ]
                };
                this.set("FixedFilterConfig", fixedFilterConfig);
            }
        },
        diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
    };
});