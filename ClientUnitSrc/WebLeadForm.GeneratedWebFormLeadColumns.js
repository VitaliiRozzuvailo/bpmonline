define('GeneratedWebFormLeadColumns', ['ext-base', 'terrasoft', 'sandbox',
    'Lead', 'GeneratedWebFormLeadColumnsStructure', 'GeneratedWebFormLeadColumnsResources'],
    function(Ext, Terrasoft, sandbox, Lead, structure, resources) {
        structure.userCode = function() {
            this.entitySchema = Lead;
            this.name = 'GeneratedWebFormLeadColumnsCardViewModel';
            this.schema.leftPanel = [];
            this.methods.getHeader = function() {
                return resources.localizableStrings.PageHeader;
            };
        };
        return structure;
    });