var appointmentParser = appointmentParser || {}

appointmentParser.parseScheduledAppointmentBlocks = function(results){

    // parse the dates from strings into data objects, **ignoring the time zone, since we always want to display in the server's time zone**
    var parseAppointmentBlockDate = function(data){
        return  moment(data.startDate, "YYYY-MM-DDTHH:mm:ss.SSS").format("HH:mm a") + " - "
            + moment(data.endDate, "YYYY-MM-DDTHH:mm:ss.SSS").format("HH:mm a");
    };

    var parsePatients = function(data){
        var patients = [];

        data.forEach( function( apppointment){
            patients.push(apppointment.patient.person.display + " (" + apppointment.appointmentType.display + ")");
        });

        return patients;
    };

    var parsePatientsIdentifiers = function(data){
        var patientsIdentifierPrimary = [];
        var patientsIdentifierDossier = [];

        data.forEach(function(appointment){
            appointment.patient.identifiers.forEach(function(identifier){
                if (identifier.display.indexOf("ZL EMR ID") > -1 ) {
                    patientsIdentifierPrimary.push(identifier.display.split("=")[1].trim());
                } else if (identifier.display.indexOf("Nimewo Dosye") > -1 ) {
                    patientsIdentifierDossier.push(identifier.display.split("=")[1].trim());
                }
            });
        });

        return { primary: patientsIdentifierPrimary, dossier: patientsIdentifierDossier };
    };

    results.forEach(function(result){
        result['date'] = parseAppointmentBlockDate(result.appointmentBlock)
        result['patients'] = parsePatients(result.appointments);
        var patientIdentifiers = parsePatientsIdentifiers(result.appointments);
        result['patientsIdentifierPrimary'] = patientIdentifiers['primary'];
        result['patientsIdentifierDossier'] = patientIdentifiers['dossier'];
    });

    return results;
}



