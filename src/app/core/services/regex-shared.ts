export class RegexShared {
    regexEmail: RegExp = /^(?:[A-z0-9!#$%&'*\/=?^_{|}~]+(?:\.[A-z0-9!#$%&'*+\/=?^_{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")[\.\_\-\+]?(?:[A-z0-9!#$%&'*+\/=?^_{|}~-]+(?:\.[A-z0-9!#$%&'*+\/=?^_{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[A-z0-9](?:[A-z0-9-]*[A-z0-9])?\.)+[A-z0-9](?:[A-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[A-z0-9-]*[A-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
    regexPhone: RegExp = /[0-9]{10}/g;
    regexDate: RegExp = /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/;
    regexMobile: RegExp = /^0(6|7)[0-9]{8}/g;
    regexCp: RegExp = /[0-9]{5}/g;
    //regexSmsExpediteur: RegExp = /^(?!0).*[a-zA-Z]+[0-9]*/;
    regexSmsExpediteur: RegExp = /^(?!0)(?:[0-9]+[a-z]|[a-z]+[0-9]|[a-z])[a-z0-9]*$/i;
    regexSmsCharBlackListe: RegExp = /([^a-zA-Z0-9 ,\-é\.:\(\)!\"#\$\%\&\'\*\+\/;<=>\?\@\_à\\¡£¤¥ñòöøùü\[\]€\{\}\|ìèæåä¿ßÜØÖÑÉÆÅÄ§\n]){1}/g;
    regexSmsCharDouble: RegExp = /([à\\¡£¤¥ñòöøùü\[\]€\{\}\|ìèæåä¿ßÜØÖÑÉÆÅÄ§\n]){1}/g;
    
    /* Global ones */
    
    /* At least one alphabetic character */
    oneAlphaChar: RegExp = /[a-zA-Z]/;
    regexOnlyAlphaNumeric: RegExp = /^[A-Za-z0-9]+$/;
}