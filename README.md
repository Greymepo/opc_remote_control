# opc_remote_control

Diese Applikation ist ein Tool zum Zusammenfassen und Steuern von OPC UA fähigen Maschinen.
In der Architektur, in welcher diese Applikation nur einen Teil darstallt, werden mehrere OPC UA fähige Maschinen über diese Applikation in ein Netzwerk aus Cloud-Systemen, OPC Maschienen und Kunden als Service zur Verfügung gestellt.

In der aktuellen Applikation wird eine Komposition von Maschinen unter dem Namen "MPS_System_403_1_DiK_01" als Service namens "test" im Netzwerk angemeldet.

Die Komposition besteht aus allen Maschinen, die über den OPCHUB, mit ihrem Identifier und der IP registriert sind.
Man fügt erst alle Maschinen zum Hub hinzu und installiert dann eine Subscription auf eine OPC Variable, welche als Input für die Applikation dient, um im Netzwerk nach Aufträgen für einen Service zu suchen, welcher hier spezifiziert wurde.

Wird über die Aktuell angegebene Node 'ns=3;s="FB_Zeitkontrolle_Adriaan_scl_DB"."CoId"' der Input "filename" gelesen, so wird zuerst lokal und anschließend Online nach dem Auftragsnamen "filename" gesucht. Dieser wird anschließend in die Ausführungswarteschlage gereiht.
Hierzu ist die Klasse "ServiceExecutor" interessant.

Ein Programm kann die hier spezifizierten Maschinen unter ihrem Identifier nutzen, welcher mitgegeben wurde, um die Maschine im OPCHUB anzumelden.

Beispielprogramme befinden sich im service resources ordner.
Eigene Programme können über den Web Client hochgeladen werden.
