$(document).ready(submit);

function submit() {    
    addRegionToOptions(regioniToComuni);
    addComuniToOptions(regioniToComuni);      
    addEditableRegionalIrpef(comuniToIrpef);
    $(document).on('submit', '#submit-salary', () => {
        render();
        $( "#body").show('slow');
        return false;
     });
     
}
function render() {
    var ral = $('#ral').val();        
    var regione = $('#region').children("option:selected").text();
    var comune = $('#comune').children("option:selected").text();

    var standardSalary = calcolaNetto(ral, regione, comune, false);
    console.log('standard '+standardSalary)
    var rientroSalary = calcolaNetto(ral, regione, comune, true);
    console.log('rientro '+rientroSalary)
    $('#nettoAnnualeS').text(Math.round(standardSalary));
    $('#nettoAnnualeC').text(Math.round(rientroSalary));

    var percentualeTasseS = (1 - standardSalary/ral)*100;
    var percentualeTasseC = (1 - rientroSalary/ral)*100;
    $('#tasseTotS').text(Math.round(percentualeTasseS));
    $('#tasseTotC').text(Math.round(percentualeTasseC));
    fillTableSalaries(standardSalary, rientroSalary, mesi);
    fillTableTaxes(ral);
    $( "#body" ).hide();
    $("#btnIrpefInfo").unbind('click').bind('click',function() {
        $( ".collapsemeIrpef").toggle('slow');
    });
}

function fillTableTaxes (ral) {
    $('#taxRalS').text(ral);
    $('#taxRalC').text(ral);
    var regione = $('#region').children("option:selected").text();
    let inps = calcolaInps(ral)
    $('#taxInpsS').text(Math.round(inps));
    $('#taxInpsC').text(Math.round(inps));

    let biS = baseImponibile(ral, regione, false);
    let biC = baseImponibile(ral, regione, true);
    $('#imponibileIrpefS').text(Math.round(biS));
    $('#imponibileIrpefC').text(Math.round(biC));

    let standardiIrpef = calcolaIrpef(biS);
    let rientroIrpef = calcolaIrpef(biC);
    $('#taxIrpefS').text(Math.round(standardiIrpef));
    $('#taxIrpefC').text(Math.round(rientroIrpef));
    $('#TotIrpefS').text(Math.round(standardiIrpef));
    $('#TotIrpefC').text(Math.round(rientroIrpef));

    let standardiIrpefRegione = calcolaIrpefRegione(biS, regione);
    let rientroIrpefRegione = calcolaIrpefRegione(biC, regione);
    $('#taxRegioneS').text(Math.round(standardiIrpefRegione));
    $('#taxRegioneC').text(Math.round(rientroIrpefRegione));

    let standardiIrpefComune = calcolaIrpefComune(biS, 'Catania');
    let rientroIrpefComune = calcolaIrpefComune(biC, 'Catania');
    $('#taxComuneS').text(Math.round(standardiIrpefComune));
    $('#taxComuneC').text(Math.round(rientroIrpefComune));


    var irpefTotS = standardiIrpef + standardiIrpefRegione + standardiIrpefComune;
    var irpefTotC = rientroIrpef + rientroIrpefRegione + rientroIrpefComune;
    $('#irpefTotS').text(Math.round(irpefTotS));
    $('#irpefTotC').text(Math.round(irpefTotC));

    var biCArr = findScaglioniIrpef(biC, soglieIrpefToPercentualeMarginale);
    var biSArr = findScaglioniIrpef(biS, soglieIrpefToPercentualeMarginale);
    fillScaglioniIrpef(biCArr, '#irpefC');
    fillScaglioniIrpef(biSArr, '#irpefS');
}


var mesi = [12,13,14];
function fillTableSalaries (std,rientro, mesi){
    mesi.forEach(mese => fillTableSalary(std, rientro, mese));
}

function fillTableSalary(std,rientro, mese) {
    $('#standard'+mese).text(Math.round(std/mese));
    $('#rientro'+mese).text(Math.round(rientro/mese));
    $('#dif'+mese).text(Math.round((rientro-std)/mese));
}


function addRegionToOptions(regioniToComuni) {
    for (const regione in regioniToComuni) {
        $('#region').append($('<option>', { 
            value: regione,
            text : regione
        }));
    }
}

function addComuniToOptions(regioniToComuni){
    $("#region").change(function(){
        $('#comune').html('<option disabled selected>Comune</option>');   
        for (const regione in regioniToComuni) {            
            if(regione == $('#region').children("option:selected").val()){
                for (const c in regioniToComuni[regione]) {
                    $('#comune').append($('<option>', { 
                        value: regioniToComuni[regione][c],
                        text : regioniToComuni[regione][c]
                    }));
                }
            }            
        }      
    });
}

function addEditableRegionalIrpef(comuniToIrpef) {
    $("#comune").change(function(){
        for (const comune in comuniToIrpef) {
            if (comune == $('#comune').children("option:selected").val()) {                
                if(comuniToIrpef[comune] == undefined){
                    $('#warningComune').show()
                } else {
                    $('#warningComune').hide();

                }
            }
        }
    });
}

function findScaglioniIrpef(bi, soglieToPercentualeMarginale) {
    var tasseTotale = 0;
    var resto = bi;
    var sogliaPrecedente = 0;
    var scaglioniIrpef = [];
    for (const soglia in soglieToPercentualeMarginale) {
        var percentuale = soglieToPercentualeMarginale[soglia]
        var deltaSoglia = soglia - sogliaPrecedente;
        var used = Math.min(deltaSoglia, resto);
        resto -= used;
        tasseTotale += used*percentuale;
        scaglioniIrpef.push(used*percentuale);
    }
    return scaglioniIrpef;
}

function fillScaglioniIrpef(arr,id){
    for (const i in arr){
        $(id+i).text(Math.round(arr[i]));
    }
    
}


$(function() {
    render();
});


