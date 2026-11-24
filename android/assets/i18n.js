// Języki interfejsu. Każdy klucz: [pl, en, de, es, fr, it, pt, uk, ru]. Brak tłumaczenia → angielski → polski.
// {x} w tekście to wstawiana wartość.
'use strict';
window.I18N = (() => {
  const LANGS = [
    ['pl', 'Polski', '🇵🇱'], ['en', 'English', '🇬🇧'], ['de', 'Deutsch', '🇩🇪'], ['es', 'Español', '🇪🇸'], ['fr', 'Français', '🇫🇷'],
    ['it', 'Italiano', '🇮🇹'], ['pt', 'Português', '🇵🇹'], ['uk', 'Українська', '🇺🇦'], ['ru', 'Русский', '🇷🇺'],
  ];
  const CODES = LANGS.map(l => l[0]);
  const T = {
    // ---------- wybór języka ----------
    lang_title: ['Wybierz język', 'Choose your language', 'Sprache wählen', 'Elige tu idioma', 'Choisissez votre langue', 'Scegli la lingua', 'Escolha o idioma', 'Оберіть мову', 'Выберите язык'],
    lang_sub: ['Zmienisz go później w Ustawieniach.', 'You can change it later in Settings.', 'Du kannst sie später in den Einstellungen ändern.', 'Puedes cambiarlo luego en Ajustes.', 'Vous pourrez la changer plus tard dans Réglages.', 'Puoi cambiarla più tardi nelle Impostazioni.', 'Pode alterá-lo depois nas Definições.', 'Її можна змінити пізніше в Налаштуваннях.', 'Его можно изменить позже в Настройках.'],
    set_lang: ['Język', 'Language', 'Sprache', 'Idioma', 'Langue', 'Lingua', 'Idioma', 'Мова', 'Язык'],

    // ---------- parowanie ----------
    pair_intro: ['Połącz telefon z komputerem. Oba urządzenia muszą być w tej samej sieci Wi‑Fi.', 'Connect your phone to your computer. Both devices must be on the same Wi‑Fi network.', 'Verbinde dein Handy mit deinem Computer. Beide Geräte müssen im selben WLAN sein.', 'Conecta el teléfono con el ordenador. Ambos dispositivos deben estar en la misma red Wi‑Fi.', 'Connectez votre téléphone à votre ordinateur. Les deux appareils doivent être sur le même réseau Wi‑Fi.', 'Collega il telefono al computer. Entrambi i dispositivi devono essere sulla stessa rete Wi‑Fi.', 'Ligue o telemóvel ao computador. Ambos os dispositivos têm de estar na mesma rede Wi‑Fi.', 'Підключіть телефон до комп’ютера. Обидва пристрої мають бути в одній мережі Wi‑Fi.', 'Подключите телефон к компьютеру. Оба устройства должны быть в одной сети Wi‑Fi.'],
    pair_host: ['Adres komputera', 'Computer address', 'Adresse des Computers', 'Dirección del ordenador', 'Adresse de l’ordinateur', 'Indirizzo del computer', 'Endereço do computador', 'Адреса комп’ютера', 'Адрес компьютера'],
    pair_host_ph: ['np. 192.168.1.20:8765', 'e.g. 192.168.1.20:8765', 'z. B. 192.168.1.20:8765', 'p. ej. 192.168.1.20:8765', 'ex. 192.168.1.20:8765', 'es. 192.168.1.20:8765', 'ex. 192.168.1.20:8765', 'напр. 192.168.1.20:8765', 'напр. 192.168.1.20:8765'],
    pair_code: ['Kod parowania', 'Pairing code', 'Kopplungscode', 'Código de emparejamiento', 'Code d’appairage', 'Codice di abbinamento', 'Código de emparelhamento', 'Код підключення', 'Код подключения'],
    ph_need: [
      '<b>Najpierw:</b> na komputerze musi być zainstalowany <b>Claude Code</b> (claude.com/claude-code) i trzeba się w nim raz zalogować. Bez niego działa tylko zwykły terminal i nie ma limitów.',
      '<b>First:</b> <b>Claude Code</b> must be installed on the computer (claude.com/claude-code) and you need to sign in to it once. Without it you only get a plain terminal and no limits.',
      '<b>Zuerst:</b> Auf dem Computer muss <b>Claude Code</b> installiert sein (claude.com/claude-code) und du musst dich einmal anmelden. Ohne Claude Code gibt es nur ein normales Terminal und keine Limits.',
      '<b>Primero:</b> en el ordenador debe estar instalado <b>Claude Code</b> (claude.com/claude-code) y hay que iniciar sesión una vez. Sin él solo tendrás un terminal normal y no verás los límites.',
      '<b>D’abord :</b> <b>Claude Code</b> doit être installé sur l’ordinateur (claude.com/claude-code) et il faut s’y connecter une fois. Sans lui, vous n’aurez qu’un terminal classique et pas de limites.',
      '<b>Prima di tutto:</b> sul computer deve essere installato <b>Claude Code</b> (claude.com/claude-code) e bisogna accedere una volta. Senza di esso avrai solo un terminale normale e niente limiti.',
      '<b>Primeiro:</b> o <b>Claude Code</b> tem de estar instalado no computador (claude.com/claude-code) e é preciso iniciar sessão uma vez. Sem ele, só terá um terminal normal e não verá os limites.',
      '<b>Спочатку:</b> на комп’ютері має бути встановлений <b>Claude Code</b> (claude.com/claude-code), і в ньому треба один раз увійти. Без нього буде лише звичайний термінал і без лімітів.',
      '<b>Сначала:</b> на компьютере должен быть установлен <b>Claude Code</b> (claude.com/claude-code), и в нём нужно один раз войти. Без него будет только обычный терминал и без лимитов.'],
    ph_which: ['Jaki masz komputer?', 'What computer do you have?', 'Welchen Computer hast du?', '¿Qué ordenador tienes?', 'Quel ordinateur avez-vous ?', 'Che computer hai?', 'Que computador tem?', 'Який у вас комп’ютер?', 'Какой у вас компьютер?'],
    os_win_small: ['Windows 10 i 11', 'Windows 10 and 11', 'Windows 10 und 11', 'Windows 10 y 11', 'Windows 10 et 11', 'Windows 10 e 11', 'Windows 10 e 11', 'Windows 10 і 11', 'Windows 10 и 11'],
    lin_sub: [
      'Działa na: <b>Linux Mint</b> i <b>Ubuntu</b> (sprawdzone), a także Debian, Pop!_OS, Fedora, Arch, Manjaro, openSUSE i podobnych – wystarczy Python 3.8+, który prawie każdy Linux ma od razu.',
      'Works on <b>Linux Mint</b> and <b>Ubuntu</b> (tested), and also Debian, Pop!_OS, Fedora, Arch, Manjaro, openSUSE and similar – all it needs is Python 3.8+, which almost every Linux has out of the box.',
      'Läuft auf <b>Linux Mint</b> und <b>Ubuntu</b> (getestet) sowie Debian, Pop!_OS, Fedora, Arch, Manjaro, openSUSE und ähnlichen – nötig ist nur Python 3.8+, das fast jedes Linux schon mitbringt.',
      'Funciona en <b>Linux Mint</b> y <b>Ubuntu</b> (probado), y también en Debian, Pop!_OS, Fedora, Arch, Manjaro, openSUSE y similares: solo necesita Python 3.8+, que casi todos los Linux traen de serie.',
      'Fonctionne sur <b>Linux Mint</b> et <b>Ubuntu</b> (testé), ainsi que Debian, Pop!_OS, Fedora, Arch, Manjaro, openSUSE et similaires – il suffit de Python 3.8+, présent sur presque tous les Linux.',
      'Funziona su <b>Linux Mint</b> e <b>Ubuntu</b> (provato), e anche su Debian, Pop!_OS, Fedora, Arch, Manjaro, openSUSE e simili: basta Python 3.8+, che quasi ogni Linux ha già.',
      'Funciona em <b>Linux Mint</b> e <b>Ubuntu</b> (testado) e também em Debian, Pop!_OS, Fedora, Arch, Manjaro, openSUSE e semelhantes – basta o Python 3.8+, que quase todos os Linux já trazem.',
      'Працює на <b>Linux Mint</b> і <b>Ubuntu</b> (перевірено), а також Debian, Pop!_OS, Fedora, Arch, Manjaro, openSUSE та подібних – потрібен лише Python 3.8+, який є майже в кожному Linux.',
      'Работает на <b>Linux Mint</b> и <b>Ubuntu</b> (проверено), а также Debian, Pop!_OS, Fedora, Arch, Manjaro, openSUSE и похожих – нужен только Python 3.8+, который есть почти в любом Linux.'],
    lin_1: [
      '<b>Nie masz programu?</b> Stuknij przycisk niżej – instalator zapisze się w <i>Pobranych</i> i od razu możesz go wysłać (mail, Quick Share, Dysk) albo skopiować kablem.',
      '<b>Don’t have the program yet?</b> Tap the button below – the installer is saved to <i>Downloads</i> and you can send it right away (email, Quick Share, Drive) or copy it with a cable.',
      '<b>Programm noch nicht installiert?</b> Tippe unten auf den Knopf – das Installationsprogramm landet in <i>Downloads</i> und du kannst es gleich verschicken (Mail, Quick Share, Drive) oder per Kabel kopieren.',
      '<b>¿Aún no tienes el programa?</b> Toca el botón de abajo: el instalador se guarda en <i>Descargas</i> y puedes enviarlo al momento (correo, Quick Share, Drive) o copiarlo por cable.',
      '<b>Pas encore le programme ?</b> Touchez le bouton ci-dessous : l’installateur est enregistré dans <i>Téléchargements</i> et vous pouvez l’envoyer tout de suite (e-mail, Quick Share, Drive) ou le copier par câble.',
      '<b>Non hai ancora il programma?</b> Tocca il pulsante qui sotto: l’installer viene salvato in <i>Download</i> e puoi inviarlo subito (e-mail, Quick Share, Drive) o copiarlo col cavo.',
      '<b>Ainda não tem o programa?</b> Toque no botão abaixo – o instalador fica em <i>Transferências</i> e pode enviá-lo logo (e-mail, Quick Share, Drive) ou copiá-lo por cabo.',
      '<b>Ще немає програми?</b> Натисніть кнопку нижче – інсталятор збережеться в <i>Завантаженнях</i>, і його можна одразу надіслати (пошта, Quick Share, Диск) або скопіювати кабелем.',
      '<b>Ещё нет программы?</b> Нажмите кнопку ниже – установщик сохранится в <i>Загрузках</i>, и его можно сразу отправить (почта, Quick Share, Диск) или скопировать кабелем.'],
    lin_2: [
      'Na komputerze otwórz terminal w folderze z plikiem i wpisz:<br><code>bash claude-pocket-pc.sh</code><br>Na końcu wypisze <b>adres</b> i <b>kod</b> – przepisz je tutaj.',
      'On the computer, open a terminal in the folder with the file and type:<br><code>bash claude-pocket-pc.sh</code><br>At the end it prints the <b>address</b> and <b>code</b> – enter them here.',
      'Öffne auf dem Computer ein Terminal im Ordner mit der Datei und gib ein:<br><code>bash claude-pocket-pc.sh</code><br>Am Ende zeigt es <b>Adresse</b> und <b>Code</b> – trage sie hier ein.',
      'En el ordenador, abre un terminal en la carpeta del archivo y escribe:<br><code>bash claude-pocket-pc.sh</code><br>Al final mostrará la <b>dirección</b> y el <b>código</b>: escríbelos aquí.',
      'Sur l’ordinateur, ouvrez un terminal dans le dossier du fichier et tapez :<br><code>bash claude-pocket-pc.sh</code><br>À la fin, il affiche l’<b>adresse</b> et le <b>code</b> – saisissez-les ici.',
      'Sul computer apri un terminale nella cartella del file e scrivi:<br><code>bash claude-pocket-pc.sh</code><br>Alla fine mostrerà <b>indirizzo</b> e <b>codice</b>: inseriscili qui.',
      'No computador, abra um terminal na pasta do ficheiro e escreva:<br><code>bash claude-pocket-pc.sh</code><br>No fim mostra o <b>endereço</b> e o <b>código</b> – introduza-os aqui.',
      'На комп’ютері відкрийте термінал у теці з файлом і введіть:<br><code>bash claude-pocket-pc.sh</code><br>Наприкінці він покаже <b>адресу</b> і <b>код</b> – введіть їх тут.',
      'На компьютере откройте терминал в папке с файлом и введите:<br><code>bash claude-pocket-pc.sh</code><br>В конце он покажет <b>адрес</b> и <b>код</b> – введите их здесь.'],
    lin_3: [
      '<b>Masz już program?</b> Kod pokaże komenda <code>claude-pocket-kod</code>. Komputer z panelem rice: duży zegar → Ustawienia → Telefon → <b>Pokaż kod</b>.',
      '<b>Already have the program?</b> The command <code>claude-pocket-kod</code> shows the code.',
      '<b>Programm schon installiert?</b> Der Befehl <code>claude-pocket-kod</code> zeigt den Code.',
      '<b>¿Ya tienes el programa?</b> El comando <code>claude-pocket-kod</code> muestra el código.',
      '<b>Vous avez déjà le programme ?</b> La commande <code>claude-pocket-kod</code> affiche le code.',
      '<b>Hai già il programma?</b> Il comando <code>claude-pocket-kod</code> mostra il codice.',
      '<b>Já tem o programa?</b> O comando <code>claude-pocket-kod</code> mostra o código.',
      '<b>Програма вже є?</b> Код покаже команда <code>claude-pocket-kod</code>.',
      '<b>Программа уже есть?</b> Код покажет команда <code>claude-pocket-kod</code>.'],
    win_sub: [
      'Działa na <b>Windows 10</b> (wersja 1809 lub nowsza) i <b>Windows 11</b>. Jeśli brakuje Pythona, instalator sam zaproponuje jego instalację.',
      'Works on <b>Windows 10</b> (version 1809 or newer) and <b>Windows 11</b>. If Python is missing, the installer offers to install it.',
      'Läuft auf <b>Windows 10</b> (Version 1809 oder neuer) und <b>Windows 11</b>. Fehlt Python, bietet das Installationsprogramm an, es zu installieren.',
      'Funciona en <b>Windows 10</b> (versión 1809 o posterior) y <b>Windows 11</b>. Si falta Python, el instalador ofrecerá instalarlo.',
      'Fonctionne sous <b>Windows 10</b> (version 1809 ou ultérieure) et <b>Windows 11</b>. Si Python manque, l’installateur propose de l’installer.',
      'Funziona su <b>Windows 10</b> (versione 1809 o successiva) e <b>Windows 11</b>. Se manca Python, l’installer propone di installarlo.',
      'Funciona no <b>Windows 10</b> (versão 1809 ou mais recente) e no <b>Windows 11</b>. Se faltar o Python, o instalador propõe instalá-lo.',
      'Працює на <b>Windows 10</b> (версія 1809 або новіша) і <b>Windows 11</b>. Якщо немає Python, інсталятор запропонує його встановити.',
      'Работает на <b>Windows 10</b> (версия 1809 или новее) и <b>Windows 11</b>. Если нет Python, установщик предложит его установить.'],
    win_1: [
      '<b>Nie masz programu?</b> Stuknij przycisk niżej i przenieś plik na komputer: Quick Share, Dysk Google albo kablem (Gmail blokuje pliki <i>.bat</i>).',
      '<b>Don’t have the program yet?</b> Tap the button below and move the file to the computer: Quick Share, Google Drive or a cable (Gmail blocks <i>.bat</i> files).',
      '<b>Programm noch nicht installiert?</b> Tippe unten auf den Knopf und bring die Datei auf den Computer: Quick Share, Google Drive oder Kabel (Gmail blockiert <i>.bat</i>-Dateien).',
      '<b>¿Aún no tienes el programa?</b> Toca el botón de abajo y pasa el archivo al ordenador: Quick Share, Google Drive o cable (Gmail bloquea los archivos <i>.bat</i>).',
      '<b>Pas encore le programme ?</b> Touchez le bouton ci-dessous et transférez le fichier sur l’ordinateur : Quick Share, Google Drive ou câble (Gmail bloque les fichiers <i>.bat</i>).',
      '<b>Non hai ancora il programma?</b> Tocca il pulsante qui sotto e sposta il file sul computer: Quick Share, Google Drive o cavo (Gmail blocca i file <i>.bat</i>).',
      '<b>Ainda não tem o programa?</b> Toque no botão abaixo e passe o ficheiro para o computador: Quick Share, Google Drive ou cabo (o Gmail bloqueia ficheiros <i>.bat</i>).',
      '<b>Ще немає програми?</b> Натисніть кнопку нижче й перенесіть файл на комп’ютер: Quick Share, Google Диск або кабель (Gmail блокує файли <i>.bat</i>).',
      '<b>Ещё нет программы?</b> Нажмите кнопку ниже и перенесите файл на компьютер: Quick Share, Google Диск или кабель (Gmail блокирует файлы <i>.bat</i>).'],
    win_2: [
      'Na komputerze kliknij dwa razy <code>claude-pocket-windows.bat</code>. Gdy pojawi się „System Windows ochronił ten komputer” – <b>Więcej informacji → Uruchom mimo to</b>. Gdy zapora zapyta o Pythona – zaznacz <b>Sieci prywatne</b> i <b>Zezwól</b>.',
      'On the computer, double-click <code>claude-pocket-windows.bat</code>. If you see “Windows protected your PC” – <b>More info → Run anyway</b>. When the firewall asks about Python – tick <b>Private networks</b> and <b>Allow access</b>.',
      'Doppelklicke auf dem Computer auf <code>claude-pocket-windows.bat</code>. Erscheint „Der Computer wurde durch Windows geschützt“ – <b>Weitere Informationen → Trotzdem ausführen</b>. Fragt die Firewall nach Python – <b>Private Netzwerke</b> ankreuzen und <b>Zugriff zulassen</b>.',
      'En el ordenador, haz doble clic en <code>claude-pocket-windows.bat</code>. Si aparece «Windows protegió su PC» – <b>Más información → Ejecutar de todas formas</b>. Cuando el firewall pregunte por Python – marca <b>Redes privadas</b> y <b>Permitir acceso</b>.',
      'Sur l’ordinateur, double-cliquez sur <code>claude-pocket-windows.bat</code>. Si « Windows a protégé votre ordinateur » s’affiche – <b>Informations complémentaires → Exécuter quand même</b>. Quand le pare-feu demande pour Python – cochez <b>Réseaux privés</b> puis <b>Autoriser l’accès</b>.',
      'Sul computer fai doppio clic su <code>claude-pocket-windows.bat</code>. Se compare «PC protetto da Windows» – <b>Ulteriori informazioni → Esegui comunque</b>. Quando il firewall chiede di Python – spunta <b>Reti private</b> e <b>Consenti accesso</b>.',
      'No computador, faça duplo clique em <code>claude-pocket-windows.bat</code>. Se aparecer «O Windows protegeu o computador» – <b>Mais informações → Executar assim mesmo</b>. Quando a firewall perguntar pelo Python – marque <b>Redes privadas</b> e <b>Permitir acesso</b>.',
      'На комп’ютері двічі клацніть <code>claude-pocket-windows.bat</code>. Якщо з’явиться «Windows захистив ваш комп’ютер» – <b>Докладніше → Усе одно запустити</b>. Коли брандмауер запитає про Python – позначте <b>Приватні мережі</b> й <b>Дозволити доступ</b>.',
      'На компьютере дважды щёлкните <code>claude-pocket-windows.bat</code>. Если появится «Система Windows защитила ваш компьютер» – <b>Подробнее → Выполнить в любом случае</b>. Когда брандмауэр спросит про Python – отметьте <b>Частные сети</b> и <b>Разрешить доступ</b>.'],
    win_3: [
      'Na końcu zobaczysz <b>adres</b> i <b>kod</b>. Później znajdziesz je w menu Start → <b>Claude Pocket – kod</b>.',
      'At the end you’ll see the <b>address</b> and <b>code</b>. Later you’ll find them in the Start menu → <b>Claude Pocket – kod</b>.',
      'Am Ende siehst du <b>Adresse</b> und <b>Code</b>. Später findest du sie im Startmenü → <b>Claude Pocket – kod</b>.',
      'Al final verás la <b>dirección</b> y el <b>código</b>. Después los encontrarás en el menú Inicio → <b>Claude Pocket – kod</b>.',
      'À la fin, vous verrez l’<b>adresse</b> et le <b>code</b>. Plus tard, vous les trouverez dans le menu Démarrer → <b>Claude Pocket – kod</b>.',
      'Alla fine vedrai <b>indirizzo</b> e <b>codice</b>. In seguito li trovi nel menu Start → <b>Claude Pocket – kod</b>.',
      'No fim verá o <b>endereço</b> e o <b>código</b>. Mais tarde encontra-os no menu Iniciar → <b>Claude Pocket – kod</b>.',
      'Наприкінці побачите <b>адресу</b> і <b>код</b>. Пізніше вони є в меню «Пуск» → <b>Claude Pocket – kod</b>.',
      'В конце вы увидите <b>адрес</b> и <b>код</b>. Позже они есть в меню «Пуск» → <b>Claude Pocket – kod</b>.'],
    pc_inst: ['⬇ Zapisz instalator na komputer', '⬇ Save the computer installer', '⬇ Installer für den Computer speichern', '⬇ Guardar el instalador para el ordenador', '⬇ Enregistrer l’installateur pour l’ordinateur', '⬇ Salva l’installer per il computer', '⬇ Guardar o instalador para o computador', '⬇ Зберегти інсталятор для комп’ютера', '⬇ Сохранить установщик для компьютера'],
    inst_btn_lin: ['⬇ Zapisz instalator dla Linuksa', '⬇ Save the Linux installer', '⬇ Linux-Installer speichern', '⬇ Guardar el instalador para Linux', '⬇ Enregistrer l’installateur Linux', '⬇ Salva l’installer per Linux', '⬇ Guardar o instalador para Linux', '⬇ Зберегти інсталятор для Linux', '⬇ Сохранить установщик для Linux'],
    inst_btn_win: ['⬇ Zapisz instalator dla Windowsa', '⬇ Save the Windows installer', '⬇ Windows-Installer speichern', '⬇ Guardar el instalador para Windows', '⬇ Enregistrer l’installateur Windows', '⬇ Salva l’installer per Windows', '⬇ Guardar o instalador para Windows', '⬇ Зберегти інсталятор для Windows', '⬇ Сохранить установщик для Windows'],
    ph_warn: [
      'W domu telefon i komputer muszą być w tym samym Wi‑Fi. Kodu nie podawaj obcym – daje dostęp do terminala komputera.',
      'At home, the phone and computer must be on the same Wi‑Fi. Don’t share the code with strangers – it gives access to the computer’s terminal.',
      'Zu Hause müssen Handy und Computer im selben WLAN sein. Gib den Code niemandem – er öffnet das Terminal deines Computers.',
      'En casa, el teléfono y el ordenador deben estar en la misma Wi‑Fi. No compartas el código: da acceso al terminal del ordenador.',
      'À la maison, le téléphone et l’ordinateur doivent être sur le même Wi‑Fi. Ne donnez pas le code à des inconnus : il donne accès au terminal de l’ordinateur.',
      'A casa telefono e computer devono essere sulla stessa Wi‑Fi. Non dare il codice a estranei: dà accesso al terminale del computer.',
      'Em casa, o telemóvel e o computador têm de estar na mesma Wi‑Fi. Não partilhe o código – dá acesso ao terminal do computador.',
      'Удома телефон і комп’ютер мають бути в одній Wi‑Fi. Не давайте код стороннім – він відкриває доступ до термінала комп’ютера.',
      'Дома телефон и компьютер должны быть в одной Wi‑Fi. Не давайте код посторонним – он открывает доступ к терминалу компьютера.'],
    away_title: ['Poza domem (Tailscale)', 'Away from home (Tailscale)', 'Unterwegs (Tailscale)', 'Fuera de casa (Tailscale)', 'Hors de la maison (Tailscale)', 'Fuori casa (Tailscale)', 'Fora de casa (Tailscale)', 'Поза домом (Tailscale)', 'Вне дома (Tailscale)'],
    away_1: [
      'Zainstaluj darmową aplikację <b>Tailscale</b> na telefonie (Sklep Play) i na komputerze (tailscale.com/download).',
      'Install the free <b>Tailscale</b> app on the phone (Play Store) and on the computer (tailscale.com/download).',
      'Installiere die kostenlose App <b>Tailscale</b> auf dem Handy (Play Store) und auf dem Computer (tailscale.com/download).',
      'Instala la app gratuita <b>Tailscale</b> en el teléfono (Play Store) y en el ordenador (tailscale.com/download).',
      'Installez l’application gratuite <b>Tailscale</b> sur le téléphone (Play Store) et sur l’ordinateur (tailscale.com/download).',
      'Installa l’app gratuita <b>Tailscale</b> sul telefono (Play Store) e sul computer (tailscale.com/download).',
      'Instale a app gratuita <b>Tailscale</b> no telemóvel (Play Store) e no computador (tailscale.com/download).',
      'Встановіть безкоштовний застосунок <b>Tailscale</b> на телефон (Play Маркет) і на комп’ютер (tailscale.com/download).',
      'Установите бесплатное приложение <b>Tailscale</b> на телефон (Play Маркет) и на компьютер (tailscale.com/download).'],
    away_2: [
      'Zaloguj się w obu <b>na to samo konto</b> (np. Google) i włącz połączenie.',
      'Sign in on both with <b>the same account</b> (e.g. Google) and turn the connection on.',
      'Melde dich auf beiden mit <b>demselben Konto</b> an (z. B. Google) und schalte die Verbindung ein.',
      'Inicia sesión en ambos con <b>la misma cuenta</b> (p. ej. Google) y activa la conexión.',
      'Connectez-vous sur les deux avec <b>le même compte</b> (ex. Google) et activez la connexion.',
      'Accedi su entrambi con <b>lo stesso account</b> (es. Google) e attiva la connessione.',
      'Inicie sessão em ambos com <b>a mesma conta</b> (ex. Google) e ative a ligação.',
      'Увійдіть на обох пристроях в <b>той самий обліковий запис</b> (напр. Google) і ввімкніть з’єднання.',
      'Войдите на обоих устройствах в <b>один и тот же аккаунт</b> (напр. Google) и включите соединение.'],
    away_3: [
      'Połącz się raz w domu przez Wi‑Fi – aplikacja sama zapamięta adres Tailscale komputera (100.x.x.x) i poza domem przełączy się na niego.',
      'Connect once at home over Wi‑Fi – the app remembers the computer’s Tailscale address (100.x.x.x) and switches to it when you’re away.',
      'Verbinde dich einmal zu Hause über WLAN – die App merkt sich die Tailscale-Adresse des Computers (100.x.x.x) und wechselt unterwegs automatisch dorthin.',
      'Conéctate una vez en casa por Wi‑Fi: la app recordará la dirección Tailscale del ordenador (100.x.x.x) y fuera de casa cambiará a ella sola.',
      'Connectez-vous une fois à la maison en Wi‑Fi : l’application retient l’adresse Tailscale de l’ordinateur (100.x.x.x) et l’utilise toute seule à l’extérieur.',
      'Collegati una volta a casa via Wi‑Fi: l’app ricorda l’indirizzo Tailscale del computer (100.x.x.x) e fuori casa passa da sola a quello.',
      'Ligue-se uma vez em casa por Wi‑Fi – a app memoriza o endereço Tailscale do computador (100.x.x.x) e fora de casa muda para ele sozinha.',
      'Підключіться один раз удома через Wi‑Fi – застосунок запам’ятає Tailscale-адресу комп’ютера (100.x.x.x) і поза домом сам перемкнеться на неї.',
      'Подключитесь один раз дома по Wi‑Fi – приложение запомнит Tailscale-адрес компьютера (100.x.x.x) и вне дома само переключится на него.'],
    away_4: [
      'Komputer musi być włączony, a Tailscale włączony na obu urządzeniach.',
      'The computer must be on, and Tailscale must be on on both devices.',
      'Der Computer muss eingeschaltet sein und Tailscale auf beiden Geräten laufen.',
      'El ordenador debe estar encendido y Tailscale activado en ambos dispositivos.',
      'L’ordinateur doit être allumé et Tailscale activé sur les deux appareils.',
      'Il computer deve essere acceso e Tailscale attivo su entrambi i dispositivi.',
      'O computador tem de estar ligado e o Tailscale ativo em ambos os dispositivos.',
      'Комп’ютер має бути увімкнений, а Tailscale – увімкнений на обох пристроях.',
      'Компьютер должен быть включён, а Tailscale – включён на обоих устройствах.'],
    pair_go: ['Połącz', 'Connect', 'Verbinden', 'Conectar', 'Connecter', 'Connetti', 'Ligar', 'Підключити', 'Подключить'],
    connecting_btn: ['Łączę…', 'Connecting…', 'Verbinde…', 'Conectando…', 'Connexion…', 'Connessione…', 'A ligar…', 'Підключаю…', 'Подключаю…'],

    // ---------- błędy ----------
    err_code: ['Zły kod parowania – sprawdź go na komputerze.', 'Wrong pairing code – check it on the computer.', 'Falscher Kopplungscode – prüfe ihn am Computer.', 'Código incorrecto: compruébalo en el ordenador.', 'Code d’appairage incorrect – vérifiez-le sur l’ordinateur.', 'Codice errato: controllalo sul computer.', 'Código errado – verifique-o no computador.', 'Неправильний код – перевірте його на комп’ютері.', 'Неверный код – проверьте его на компьютере.'],
    err_locked: ['Za dużo błędnych prób – odczekaj 5 minut.', 'Too many wrong attempts – wait 5 minutes.', 'Zu viele Fehlversuche – warte 5 Minuten.', 'Demasiados intentos fallidos: espera 5 minutos.', 'Trop d’essais ratés – attendez 5 minutes.', 'Troppi tentativi errati: aspetta 5 minuti.', 'Demasiadas tentativas erradas – aguarde 5 minutos.', 'Забагато невдалих спроб – зачекайте 5 хвилин.', 'Слишком много неверных попыток – подождите 5 минут.'],
    err_lan: ['Komputer przyjmuje połączenia tylko z domowego Wi‑Fi albo przez Tailscale.', 'The computer only accepts connections from the home Wi‑Fi or via Tailscale.', 'Der Computer nimmt nur Verbindungen aus dem Heim-WLAN oder über Tailscale an.', 'El ordenador solo acepta conexiones desde la Wi‑Fi de casa o por Tailscale.', 'L’ordinateur n’accepte que les connexions du Wi‑Fi de la maison ou via Tailscale.', 'Il computer accetta connessioni solo dalla Wi‑Fi di casa o tramite Tailscale.', 'O computador só aceita ligações da Wi‑Fi de casa ou via Tailscale.', 'Комп’ютер приймає з’єднання лише з домашньої Wi‑Fi або через Tailscale.', 'Компьютер принимает подключения только из домашней Wi‑Fi или через Tailscale.'],
    err_net: ['Nie widzę komputera. W domu: to samo Wi‑Fi. Poza domem: włączony Tailscale. I czy komputer jest włączony?', 'Can’t see the computer. At home: same Wi‑Fi. Away: Tailscale on. And is the computer switched on?', 'Computer nicht gefunden. Zu Hause: dasselbe WLAN. Unterwegs: Tailscale an. Und ist der Computer eingeschaltet?', 'No veo el ordenador. En casa: la misma Wi‑Fi. Fuera: Tailscale activado. ¿Y está encendido el ordenador?', 'Ordinateur introuvable. À la maison : même Wi‑Fi. À l’extérieur : Tailscale activé. Et l’ordinateur est-il allumé ?', 'Non vedo il computer. A casa: stessa Wi‑Fi. Fuori: Tailscale attivo. E il computer è acceso?', 'Não vejo o computador. Em casa: a mesma Wi‑Fi. Fora: Tailscale ativo. E o computador está ligado?', 'Не бачу комп’ютера. Удома: та сама Wi‑Fi. Поза домом: увімкнений Tailscale. І чи увімкнений комп’ютер?', 'Не вижу компьютер. Дома: та же Wi‑Fi. Вне дома: включённый Tailscale. И включён ли компьютер?'],
    inst_only_app: ['Ta funkcja działa tylko w aplikacji na telefonie.', 'This only works in the phone app.', 'Das funktioniert nur in der Handy-App.', 'Esto solo funciona en la app del teléfono.', 'Ceci ne fonctionne que dans l’application du téléphone.', 'Funziona solo nell’app del telefono.', 'Isto só funciona na app do telemóvel.', 'Це працює лише в застосунку на телефоні.', 'Это работает только в приложении на телефоне.'],
    inst_fail: ['Nie udało się zapisać: {e}', 'Couldn’t save: {e}', 'Speichern fehlgeschlagen: {e}', 'No se pudo guardar: {e}', 'Échec de l’enregistrement : {e}', 'Impossibile salvare: {e}', 'Não foi possível guardar: {e}', 'Не вдалося зберегти: {e}', 'Не удалось сохранить: {e}'],
    inst_ok_win: ['Zapisano w Pobranych jako {f}. Na komputerze: dwuklik na pliku.', 'Saved to Downloads as {f}. On the computer: double-click the file.', 'In Downloads gespeichert als {f}. Am Computer: Doppelklick auf die Datei.', 'Guardado en Descargas como {f}. En el ordenador: doble clic en el archivo.', 'Enregistré dans Téléchargements sous {f}. Sur l’ordinateur : double-cliquez dessus.', 'Salvato in Download come {f}. Sul computer: doppio clic sul file.', 'Guardado em Transferências como {f}. No computador: duplo clique no ficheiro.', 'Збережено в Завантаженнях як {f}. На комп’ютері: двічі клацніть файл.', 'Сохранено в Загрузках как {f}. На компьютере: дважды щёлкните файл.'],
    inst_ok_lin: ['Zapisano w Pobranych jako {f}. Na komputerze: bash {f}', 'Saved to Downloads as {f}. On the computer: bash {f}', 'In Downloads gespeichert als {f}. Am Computer: bash {f}', 'Guardado en Descargas como {f}. En el ordenador: bash {f}', 'Enregistré dans Téléchargements sous {f}. Sur l’ordinateur : bash {f}', 'Salvato in Download come {f}. Sul computer: bash {f}', 'Guardado em Transferências como {f}. No computador: bash {f}', 'Збережено в Завантаженнях як {f}. На комп’ютері: bash {f}', 'Сохранено в Загрузках как {f}. На компьютере: bash {f}'],

    // ---------- pasek u góry ----------
    connecting: ['łączę…', 'connecting…', 'verbinde…', 'conectando…', 'connexion…', 'connessione…', 'a ligar…', 'підключаю…', 'подключаю…'],
    connected: ['połączono', 'connected', 'verbunden', 'conectado', 'connecté', 'connesso', 'ligado', 'підключено', 'подключено'],
    offline: ['brak połączenia', 'no connection', 'keine Verbindung', 'sin conexión', 'pas de connexion', 'nessuna connessione', 'sem ligação', 'немає з’єднання', 'нет соединения'],
    via_ts: [' · przez Tailscale', ' · via Tailscale', ' · über Tailscale', ' · por Tailscale', ' · via Tailscale', ' · via Tailscale', ' · via Tailscale', ' · через Tailscale', ' · через Tailscale'],

    // ---------- limity ----------
    lim_h5: ['⚡ Limit 5‑godzinny', '⚡ 5‑hour limit', '⚡ 5‑Stunden-Limit', '⚡ Límite de 5 horas', '⚡ Limite de 5 heures', '⚡ Limite di 5 ore', '⚡ Limite de 5 horas', '⚡ Ліміт на 5 годин', '⚡ Лимит на 5 часов'],
    lim_d7: ['📅 Limit tygodniowy', '📅 Weekly limit', '📅 Wochenlimit', '📅 Límite semanal', '📅 Limite hebdomadaire', '📅 Limite settimanale', '📅 Limite semanal', '📅 Тижневий ліміт', '📅 Недельный лимит'],
    days_title: ['Zużycie dzienne', 'Daily usage', 'Tägliche Nutzung', 'Uso diario', 'Utilisation quotidienne', 'Uso giornaliero', 'Uso diário', 'Щоденне використання', 'Ежедневное использование'],
    days_tap: [' · dotknij dzień', ' · tap a day', ' · Tag antippen', ' · toca un día', ' · touchez un jour', ' · tocca un giorno', ' · toque num dia', ' · торкніться дня', ' · коснитесь дня'],
    refresh: ['Odśwież', 'Refresh', 'Aktualisieren', 'Actualizar', 'Actualiser', 'Aggiorna', 'Atualizar', 'Оновити', 'Обновить'],
    less: ['mniej', 'less', 'weniger', 'menos', 'moins', 'meno', 'menos', 'менше', 'меньше'],
    more: ['więcej', 'more', 'mehr', 'más', 'plus', 'più', 'mais', 'більше', 'больше'],
    no_data: ['brak danych', 'no data', 'keine Daten', 'sin datos', 'pas de données', 'nessun dato', 'sem dados', 'немає даних', 'нет данных'],
    left_pct: ['zostało {p}%', '{p}% left', 'noch {p}%', 'quedan {p}%', 'reste {p}%', 'resta {p}%', 'restam {p}%', 'залишилось {p}%', 'осталось {p}%'],
    reset_in: ['reset za {a} · {b}', 'resets in {a} · {b}', 'Reset in {a} · {b}', 'se reinicia en {a} · {b}', 'remise à zéro dans {a} · {b}', 'reset tra {a} · {b}', 'reinicia em {a} · {b}', 'скидання через {a} · {b}', 'сброс через {a} · {b}'],
    today_at: ['dziś {t}', 'today {t}', 'heute {t}', 'hoy {t}', 'aujourd’hui {t}', 'oggi {t}', 'hoje {t}', 'сьогодні {t}', 'сегодня {t}'],
    tomorrow_at: ['jutro {t}', 'tomorrow {t}', 'morgen {t}', 'mañana {t}', 'demain {t}', 'domani {t}', 'amanhã {t}', 'завтра {t}', 'завтра {t}'],
    today_dot: ['Dziś · ', 'Today · ', 'Heute · ', 'Hoy · ', 'Aujourd’hui · ', 'Oggi · ', 'Hoje · ', 'Сьогодні · ', 'Сегодня · '],
    today_word: ['dziś', 'today', 'heute', 'hoy', 'aujourd’hui', 'oggi', 'hoje', 'сьогодні', 'сегодня'],
    tokens: ['{n} tokenów', '{n} tokens', '{n} Tokens', '{n} tokens', '{n} jetons', '{n} token', '{n} tokens', '{n} токенів', '{n} токенов'],
    no_tokens: ['brak tokenów', 'no tokens', 'keine Tokens', 'sin tokens', 'aucun jeton', 'nessun token', 'sem tokens', 'немає токенів', 'нет токенов'],
    mln: ['mln', 'M', 'Mio.', 'M', 'M', 'M', 'M', 'млн', 'млн'],
    thous: ['tys.', 'k', 'Tsd.', 'mil', 'k', 'k', 'mil', 'тис.', 'тыс.'],
    replies: ['{n} odpowiedzi w Claude Code', '{n} replies in Claude Code', '{n} Antworten in Claude Code', '{n} respuestas en Claude Code', '{n} réponses dans Claude Code', '{n} risposte in Claude Code', '{n} respostas no Claude Code', '{n} відповідей у Claude Code', '{n} ответов в Claude Code'],
    nothing_day: ['nic w Claude Code tego dnia', 'nothing in Claude Code that day', 'an diesem Tag nichts in Claude Code', 'nada en Claude Code ese día', 'rien dans Claude Code ce jour-là', 'niente in Claude Code quel giorno', 'nada no Claude Code nesse dia', 'того дня нічого в Claude Code', 'в этот день ничего в Claude Code'],
    week_pct: ['{p}% limitu tygodniowego (całe Claude)', '{p}% of the weekly limit (all of Claude)', '{p}% des Wochenlimits (ganz Claude)', '{p}% del límite semanal (todo Claude)', '{p}% de la limite hebdomadaire (tout Claude)', '{p}% del limite settimanale (tutto Claude)', '{p}% do limite semanal (todo o Claude)', '{p}% тижневого ліміту (увесь Claude)', '{p}% недельного лимита (весь Claude)'],
    week_since: ['limit tygodniowy: licznik działa od {d}', 'weekly limit: tracked since {d}', 'Wochenlimit: gezählt seit {d}', 'límite semanal: se cuenta desde {d}', 'limite hebdomadaire : suivie depuis {d}', 'limite settimanale: conteggiato dal {d}', 'limite semanal: contado desde {d}', 'тижневий ліміт: рахується з {d}', 'недельный лимит: считается с {d}'],
    plan_upd: ['Plan {p} · odświeżono {u}', 'Plan {p} · updated {u}', 'Tarif {p} · aktualisiert {u}', 'Plan {p} · actualizado {u}', 'Forfait {p} · mis à jour {u}', 'Piano {p} · aggiornato {u}', 'Plano {p} · atualizado {u}', 'План {p} · оновлено {u}', 'План {p} · обновлено {u}'],
    usage_token: ['Login Claude Code na komputerze wygasł – wpisz tam „claude”. Pokazuję ostatnie dane.', 'The Claude Code login on the computer has expired – type “claude” there. Showing the last data.', 'Die Claude-Code-Anmeldung am Computer ist abgelaufen – gib dort „claude“ ein. Zeige die letzten Daten.', 'La sesión de Claude Code en el ordenador ha caducado: escribe «claude» allí. Muestro los últimos datos.', 'La connexion à Claude Code sur l’ordinateur a expiré – tapez « claude » là-bas. Dernières données affichées.', 'L’accesso a Claude Code sul computer è scaduto: scrivi «claude» lì. Mostro gli ultimi dati.', 'A sessão do Claude Code no computador expirou – escreva «claude» lá. A mostrar os últimos dados.', 'Вхід у Claude Code на комп’ютері закінчився – введіть там «claude». Показую останні дані.', 'Вход в Claude Code на компьютере истёк – введите там «claude». Показываю последние данные.'],
    usage_nologin: ['Na komputerze nie ma zalogowanego Claude Code – limity pojawią się po zalogowaniu (wpisz tam „claude”).', 'Claude Code isn’t signed in on the computer – limits appear after you sign in (type “claude” there).', 'Claude Code ist am Computer nicht angemeldet – die Limits erscheinen nach der Anmeldung (gib dort „claude“ ein).', 'Claude Code no tiene sesión iniciada en el ordenador: los límites aparecerán al iniciarla (escribe «claude» allí).', 'Claude Code n’est pas connecté sur l’ordinateur – les limites apparaîtront après connexion (tapez « claude » là-bas).', 'Claude Code non ha effettuato l’accesso sul computer: i limiti compariranno dopo l’accesso (scrivi «claude» lì).', 'O Claude Code não tem sessão iniciada no computador – os limites aparecem depois (escreva «claude» lá).', 'На комп’ютері не виконано вхід у Claude Code – ліміти з’являться після входу (введіть там «claude»).', 'На компьютере не выполнен вход в Claude Code – лимиты появятся после входа (введите там «claude»).'],
    usage_last: ['Pokazuję ostatnie dane ({u}).', 'Showing the last data ({u}).', 'Zeige die letzten Daten ({u}).', 'Muestro los últimos datos ({u}).', 'Dernières données affichées ({u}).', 'Mostro gli ultimi dati ({u}).', 'A mostrar os últimos dados ({u}).', 'Показую останні дані ({u}).', 'Показываю последние данные ({u}).'],

    // ---------- terminal ----------
    ph_claude: ['Napisz do Claude Code…', 'Message Claude Code…', 'Nachricht an Claude Code…', 'Escribe a Claude Code…', 'Écrire à Claude Code…', 'Scrivi a Claude Code…', 'Escreva ao Claude Code…', 'Напишіть Claude Code…', 'Напишите Claude Code…'],
    ph_shell: ['Wpisz polecenie…', 'Type a command…', 'Befehl eingeben…', 'Escribe un comando…', 'Tapez une commande…', 'Scrivi un comando…', 'Escreva um comando…', 'Введіть команду…', 'Введите команду…'],
    term_nopc: ['nie widzę komputera – Wi‑Fi w domu albo Tailscale poza domem; dotknij ⟳', 'can’t see the computer – Wi‑Fi at home or Tailscale away; tap ⟳', 'Computer nicht gefunden – WLAN zu Hause oder Tailscale unterwegs; tippe auf ⟳', 'no veo el ordenador: Wi‑Fi en casa o Tailscale fuera; toca ⟳', 'ordinateur introuvable – Wi‑Fi à la maison ou Tailscale dehors ; touchez ⟳', 'non vedo il computer: Wi‑Fi a casa o Tailscale fuori; tocca ⟳', 'não vejo o computador – Wi‑Fi em casa ou Tailscale fora; toque em ⟳', 'не бачу комп’ютера – Wi‑Fi удома або Tailscale поза домом; торкніться ⟳', 'не вижу компьютер – Wi‑Fi дома или Tailscale вне дома; нажмите ⟳'],
    term_end_cc: ['Claude Code zakończony – dotknij ⟳, żeby uruchomić od nowa', 'Claude Code ended – tap ⟳ to start again', 'Claude Code beendet – tippe auf ⟳, um neu zu starten', 'Claude Code terminó: toca ⟳ para empezar de nuevo', 'Claude Code terminé – touchez ⟳ pour relancer', 'Claude Code terminato: tocca ⟳ per ripartire', 'Claude Code terminou – toque em ⟳ para recomeçar', 'Claude Code завершено – торкніться ⟳, щоб почати знову', 'Claude Code завершён – нажмите ⟳, чтобы начать заново'],
    term_end_sh: ['terminal zamknięty – dotknij ⟳, żeby uruchomić od nowa', 'terminal closed – tap ⟳ to start again', 'Terminal geschlossen – tippe auf ⟳, um neu zu starten', 'terminal cerrado: toca ⟳ para empezar de nuevo', 'terminal fermé – touchez ⟳ pour relancer', 'terminale chiuso: tocca ⟳ per ripartire', 'terminal fechado – toque em ⟳ para recomeçar', 'термінал закрито – торкніться ⟳, щоб почати знову', 'терминал закрыт – нажмите ⟳, чтобы начать заново'],
    term_disc: ['rozłączono{r} – dotknij ⟳, żeby połączyć ponownie', 'disconnected{r} – tap ⟳ to reconnect', 'getrennt{r} – tippe auf ⟳, um neu zu verbinden', 'desconectado{r}: toca ⟳ para reconectar', 'déconnecté{r} – touchez ⟳ pour vous reconnecter', 'disconnesso{r}: tocca ⟳ per riconnetterti', 'desligado{r} – toque em ⟳ para voltar a ligar', 'з’єднання розірвано{r} – торкніться ⟳, щоб підключитися знову', 'соединение разорвано{r} – нажмите ⟳, чтобы подключиться снова'],
    term_off: ['brak połączenia – dotknij ⟳', 'no connection – tap ⟳', 'keine Verbindung – tippe auf ⟳', 'sin conexión: toca ⟳', 'pas de connexion – touchez ⟳', 'nessuna connessione: tocca ⟳', 'sem ligação – toque em ⟳', 'немає з’єднання – торкніться ⟳', 'нет соединения – нажмите ⟳'],
    scroll_up: ['przewiń w górę', 'scroll up', 'nach oben scrollen', 'desplazar arriba', 'défiler vers le haut', 'scorri su', 'deslocar para cima', 'прокрутити вгору', 'прокрутить вверх'],
    scroll_down: ['przewiń w dół', 'scroll down', 'nach unten scrollen', 'desplazar abajo', 'défiler vers le bas', 'scorri giù', 'deslocar para baixo', 'прокрутити вниз', 'прокрутить вниз'],

    // ---------- duszek ----------
    stat_food: ['🍪 Najedzenie', '🍪 Food', '🍪 Sattheit', '🍪 Comida', '🍪 Faim', '🍪 Sazietà', '🍪 Comida', '🍪 Ситість', '🍪 Сытость'],
    stat_fun: ['💛 Humor', '💛 Mood', '💛 Laune', '💛 Humor', '💛 Humeur', '💛 Umore', '💛 Humor', '💛 Настрій', '💛 Настроение'],
    stat_energy: ['⚡ Energia', '⚡ Energy', '⚡ Energie', '⚡ Energía', '⚡ Énergie', '⚡ Energia', '⚡ Energia', '⚡ Енергія', '⚡ Энергия'],
    feed: ['Nakarm', 'Feed', 'Füttern', 'Dar de comer', 'Nourrir', 'Dai da mangiare', 'Alimentar', 'Нагодувати', 'Покормить'],
    act_pet: ['🤚 Pogłaszcz', '🤚 Pet', '🤚 Streicheln', '🤚 Acariciar', '🤚 Caresser', '🤚 Accarezza', '🤚 Fazer festas', '🤚 Погладити', '🤚 Погладить'],
    act_sleep: ['😴 Spać', '😴 Sleep', '😴 Schlafen', '😴 Dormir', '😴 Dormir', '😴 Dormi', '😴 Dormir', '😴 Спати', '😴 Спать'],
    act_wake: ['☀️ Obudź', '☀️ Wake up', '☀️ Aufwecken', '☀️ Despertar', '☀️ Réveiller', '☀️ Sveglia', '☀️ Acordar', '☀️ Розбудити', '☀️ Разбудить'],
    act_talk: ['💬 Powiedz coś', '💬 Say something', '💬 Sag was', '💬 Di algo', '💬 Dis quelque chose', '💬 Di’ qualcosa', '💬 Diz algo', '💬 Скажи щось', '💬 Скажи что-нибудь'],
    eyes: ['Oczy', 'Eyes', 'Augen', 'Ojos', 'Yeux', 'Occhi', 'Olhos', 'Очі', 'Глаза'],
    eyes_round_btn: ['● okrągłe', '● round', '● rund', '● redondos', '● ronds', '● rotondi', '● redondos', '● круглі', '● круглые'],
    eyes_square_btn: ['■ kwadratowe', '■ square', '■ eckig', '■ cuadrados', '■ carrés', '■ quadrati', '■ quadrados', '■ квадратні', '■ квадратные'],
    pet_hint: ['Przeciągnij duszka palcem, dotknij, żeby pogłaskać. Chodzi za Tobą po całej aplikacji. Meble w pokoju też da się dotknąć!', 'Drag your pet with a finger, tap to pet it. It follows you around the whole app. You can tap the furniture too!', 'Zieh dein Haustier mit dem Finger, tippe zum Streicheln. Es begleitet dich durch die ganze App. Die Möbel kannst du auch antippen!', 'Arrastra a tu mascota con el dedo y tócala para acariciarla. Te sigue por toda la app. ¡También puedes tocar los muebles!', 'Faites glisser votre compagnon du doigt, touchez-le pour le caresser. Il vous suit dans toute l’application. Les meubles se touchent aussi !', 'Trascina il tuo amico col dito, toccalo per accarezzarlo. Ti segue in tutta l’app. Puoi toccare anche i mobili!', 'Arraste o seu bichinho com o dedo e toque para lhe fazer festas. Segue-o por toda a app. Também pode tocar nos móveis!', 'Перетягніть улюбленця пальцем, торкніться, щоб погладити. Він ходить за вами по всьому застосунку. Меблі теж можна торкати!', 'Перетащите питомца пальцем, коснитесь, чтобы погладить. Он ходит за вами по всему приложению. Мебель тоже можно трогать!'],
    fav_hint: ['★ ulubione: {f}', '★ favourite: {f}', '★ Lieblingsessen: {f}', '★ favorito: {f}', '★ préféré : {f}', '★ preferito: {f}', '★ favorito: {f}', '★ улюблене: {f}', '★ любимое: {f}'],
    new_look: ['Nowy wygląd!', 'New look!', 'Neuer Look!', '¡Nuevo look!', 'Nouveau look !', 'Nuovo look!', 'Novo visual!', 'Новий вигляд!', 'Новый облик!'],
    eyes_sq_say: ['Kwadratowe oczka! Retro 😎', 'Square eyes! Retro 😎', 'Eckige Augen! Retro 😎', '¡Ojos cuadrados! Retro 😎', 'Yeux carrés ! Rétro 😎', 'Occhi quadrati! Retrò 😎', 'Olhos quadrados! Retro 😎', 'Квадратні оченята! Ретро 😎', 'Квадратные глазки! Ретро 😎'],
    eyes_round_say: ['Okrągłe oczka, klasyka ☺️', 'Round eyes, a classic ☺️', 'Runde Augen, ein Klassiker ☺️', 'Ojos redondos, un clásico ☺️', 'Yeux ronds, un classique ☺️', 'Occhi rotondi, un classico ☺️', 'Olhos redondos, um clássico ☺️', 'Круглі оченята, класика ☺️', 'Круглые глазки, классика ☺️'],
    asleep_nofood: ['Ćśś… śpię. Obudź mnie najpierw.', 'Shh… I’m sleeping. Wake me up first.', 'Pssst… ich schlafe. Weck mich zuerst.', 'Shh… estoy durmiendo. Despiértame primero.', 'Chut… je dors. Réveille-moi d’abord.', 'Shh… sto dormendo. Svegliami prima.', 'Chiu… estou a dormir. Acorda-me primeiro.', 'Тсс… я сплю. Спершу розбуди мене.', 'Тсс… я сплю. Сначала разбуди меня.'],
    yum: ['{f}! Mniam!', '{f}! Yum!', '{f}! Lecker!', '¡{f}! ¡Ñam!', '{f} ! Miam !', '{f}! Gnam!', '{f}! Nham!', '{f}! Смакота!', '{f}! Вкуснятина!'],
    ooo: ['Ooo! Co tam?', 'Ooh! What’s up?', 'Ooh! Was gibt’s?', '¡Ooh! ¿Qué pasa?', 'Ooh ! Quoi de neuf ?', 'Ooh! Che c’è?', 'Ooh! O que se passa?', 'Ооо! Що там?', 'Ооо! Что там?'],
    renamed: ['Od teraz jestem {n}!', 'From now on I’m {n}!', 'Ab jetzt heiße ich {n}!', '¡Desde ahora soy {n}!', 'Désormais, je m’appelle {n} !', 'Da ora mi chiamo {n}!', 'A partir de agora sou o {n}!', 'Відтепер я {n}!', 'Теперь я {n}!'],
    lim_crit: ['Uwaga! Limit 5 h prawie pełny ({p}%). Reset {r}.', 'Careful! The 5 h limit is almost full ({p}%). Reset {r}.', 'Achtung! Das 5‑h‑Limit ist fast voll ({p}%). Reset {r}.', '¡Ojo! El límite de 5 h está casi lleno ({p}%). Reinicio {r}.', 'Attention ! La limite de 5 h est presque pleine ({p}%). Remise à zéro {r}.', 'Attenzione! Il limite di 5 h è quasi pieno ({p}%). Reset {r}.', 'Cuidado! O limite de 5 h está quase cheio ({p}%). Reinício {r}.', 'Увага! Ліміт на 5 год майже вичерпано ({p}%). Скидання {r}.', 'Внимание! Лимит на 5 ч почти исчерпан ({p}%). Сброс {r}.'],
    lim_warn: ['Limit 5 h: {p}%. Zwolnij trochę z Claude!', '5 h limit: {p}%. Slow down a bit with Claude!', '5‑h‑Limit: {p}%. Mach mal etwas langsamer mit Claude!', 'Límite de 5 h: {p}%. ¡Frena un poco con Claude!', 'Limite de 5 h : {p}%. Ralentis un peu avec Claude !', 'Limite di 5 h: {p}%. Rallenta un po’ con Claude!', 'Limite de 5 h: {p}%. Abranda um pouco com o Claude!', 'Ліміт на 5 год: {p}%. Пригальмуй трохи з Claude!', 'Лимит на 5 ч: {p}%. Притормози немного с Claude!'],
    lim_week: ['Tydzień na {p}% limitu. Oszczędzaj do {r}!', 'The week is at {p}% of the limit. Save some until {r}!', 'Die Woche steht bei {p}% des Limits. Spar bis {r}!', 'La semana va por el {p}% del límite. ¡Ahorra hasta {r}!', 'La semaine en est à {p}% de la limite. Économise jusqu’à {r} !', 'La settimana è al {p}% del limite. Risparmia fino a {r}!', 'A semana vai em {p}% do limite. Poupa até {r}!', 'Тиждень на {p}% ліміту. Економ до {r}!', 'Неделя на {p}% лимита. Экономь до {r}!'],
    lim_low: ['Masz jeszcze {p}% limitu 5 h. Działaj z Claude!', 'You still have {p}% of the 5 h limit. Go build with Claude!', 'Du hast noch {p}% vom 5‑h‑Limit. Leg los mit Claude!', 'Aún te queda el {p}% del límite de 5 h. ¡A trabajar con Claude!', 'Il te reste {p}% de la limite de 5 h. Au travail avec Claude !', 'Ti resta il {p}% del limite di 5 h. Al lavoro con Claude!', 'Ainda tens {p}% do limite de 5 h. Mãos à obra com o Claude!', 'У тебе ще {p}% ліміту на 5 год. Дій з Claude!', 'У тебя ещё {p}% лимита на 5 ч. Действуй с Claude!'],
    lim_info: ['Limit 5 h: zostało {a}%, tygodniowy: {b}%.', '5 h limit: {a}% left, weekly: {b}%.', '5‑h‑Limit: noch {a}%, Woche: {b}%.', 'Límite de 5 h: queda {a}%, semanal: {b}%.', 'Limite de 5 h : reste {a}%, hebdo : {b}%.', 'Limite di 5 h: resta {a}%, settimanale: {b}%.', 'Limite de 5 h: restam {a}%, semanal: {b}%.', 'Ліміт на 5 год: залишилось {a}%, тижневий: {b}%.', 'Лимит на 5 ч: осталось {a}%, недельный: {b}%.'],
    something: ['coś', 'something', 'etwas', 'algo', 'quelque chose', 'qualcosa', 'algo', 'щось', 'что-то'],
    pet_aria: ['duszek', 'pet', 'Haustier', 'mascota', 'compagnon', 'amico', 'bichinho', 'улюбленець', 'питомец'],

    // ---------- pokój ----------
    room_ball: ['Hop! Piłka! ⚽', 'Boing! Ball! ⚽', 'Hopp! Ball! ⚽', '¡Bote! ¡Pelota! ⚽', 'Boing ! Le ballon ! ⚽', 'Boing! Palla! ⚽', 'Boing! Bola! ⚽', 'Гоп! М’ячик! ⚽', 'Оп! Мячик! ⚽'],
    room_ball2: ['Jeszcze raz! Rzuć jeszcze raz!', 'Again! Throw it again!', 'Nochmal! Wirf nochmal!', '¡Otra vez! ¡Tírala otra vez!', 'Encore ! Relance-le !', 'Ancora! Lanciala ancora!', 'Outra vez! Atira outra vez!', 'Ще раз! Кинь ще раз!', 'Ещё раз! Брось ещё!'],
    room_lamp_off: ['Ciemno… idealnie na drzemkę.', 'Dark… perfect for a nap.', 'Dunkel… perfekt für ein Nickerchen.', 'Oscuro… perfecto para una siesta.', 'Sombre… parfait pour une sieste.', 'Buio… perfetto per un pisolino.', 'Escuro… perfeito para uma sesta.', 'Темно… якраз для дрімоти.', 'Темно… как раз для дрёмы.'],
    room_lamp_on: ['Światło! Teraz cię widzę 💡', 'Light! Now I can see you 💡', 'Licht! Jetzt sehe ich dich 💡', '¡Luz! Ahora te veo 💡', 'De la lumière ! Je te vois 💡', 'Luce! Ora ti vedo 💡', 'Luz! Agora vejo-te 💡', 'Світло! Тепер я тебе бачу 💡', 'Свет! Теперь я тебя вижу 💡'],
    room_pc: ['To mój komputer. Gram w pasjansa 😏', 'That’s my computer. I play solitaire on it 😏', 'Das ist mein Computer. Ich spiele Solitär 😏', 'Es mi ordenador. Juego al solitario 😏', 'C’est mon ordinateur. Je joue au solitaire 😏', 'È il mio computer. Ci gioco a solitario 😏', 'É o meu computador. Jogo paciência 😏', 'Це мій комп’ютер. Граю в пасьянс 😏', 'Это мой компьютер. Играю в пасьянс 😏'],
    room_day: ['Ładnie dziś na dworze ☀️', 'Lovely weather out there ☀️', 'Schönes Wetter draußen ☀️', 'Hace buen día fuera ☀️', 'Il fait beau dehors ☀️', 'Che bella giornata fuori ☀️', 'Está um dia bonito lá fora ☀️', 'Гарна сьогодні погода ☀️', 'Хорошая сегодня погода ☀️'],
    room_night: ['Patrz, gwiazdy! ✨', 'Look, stars! ✨', 'Schau, Sterne! ✨', '¡Mira, estrellas! ✨', 'Regarde, des étoiles ! ✨', 'Guarda, le stelle! ✨', 'Olha, estrelas! ✨', 'Дивись, зорі! ✨', 'Смотри, звёзды! ✨'],
    room_plant: ['Podlewam ją codziennie. Prawie.', 'I water it every day. Almost.', 'Ich gieße sie jeden Tag. Fast.', 'La riego cada día. Casi.', 'Je l’arrose tous les jours. Presque.', 'La innaffio ogni giorno. Quasi.', 'Rego-a todos os dias. Quase.', 'Поливаю її щодня. Майже.', 'Поливаю её каждый день. Почти.'],

    // ---------- ustawienia ----------
    set_pc: ['Komputer', 'Computer', 'Computer', 'Ordenador', 'Ordinateur', 'Computer', 'Computador', 'Комп’ютер', 'Компьютер'],
    set_inst: ['Instalator programu na inny komputer:', 'Installer for another computer:', 'Installer für einen anderen Computer:', 'Instalador para otro ordenador:', 'Installateur pour un autre ordinateur :', 'Installer per un altro computer:', 'Instalador para outro computador:', 'Інсталятор для іншого комп’ютера:', 'Установщик для другого компьютера:'],
    tail_hint: ['Poza domem: włącz Tailscale na komputerze i w telefonie – apka sama przełączy się na tunel.', 'Away from home: turn on Tailscale on the computer and the phone – the app switches to the tunnel by itself.', 'Unterwegs: Tailscale auf Computer und Handy einschalten – die App wechselt selbst in den Tunnel.', 'Fuera de casa: activa Tailscale en el ordenador y en el teléfono; la app cambiará sola al túnel.', 'Hors de la maison : activez Tailscale sur l’ordinateur et le téléphone – l’application passe seule par le tunnel.', 'Fuori casa: attiva Tailscale sul computer e sul telefono; l’app passa da sola al tunnel.', 'Fora de casa: ative o Tailscale no computador e no telemóvel – a app muda sozinha para o túnel.', 'Поза домом: увімкніть Tailscale на комп’ютері й телефоні – застосунок сам перейде на тунель.', 'Вне дома: включите Tailscale на компьютере и телефоне – приложение само переключится на туннель.'],
    tail_ready: ['Tailscale gotowy ({ip}) – poza domem apka połączy się sama.', 'Tailscale ready ({ip}) – away from home the app connects by itself.', 'Tailscale bereit ({ip}) – unterwegs verbindet sich die App selbst.', 'Tailscale listo ({ip}): fuera de casa la app se conectará sola.', 'Tailscale prêt ({ip}) – hors de la maison, l’application se connecte seule.', 'Tailscale pronto ({ip}): fuori casa l’app si collega da sola.', 'Tailscale pronto ({ip}) – fora de casa a app liga-se sozinha.', 'Tailscale готовий ({ip}) – поза домом застосунок підключиться сам.', 'Tailscale готов ({ip}) – вне дома приложение подключится само.'],
    unpair: ['Rozłącz i sparuj ponownie', 'Disconnect and pair again', 'Trennen und neu koppeln', 'Desconectar y emparejar de nuevo', 'Déconnecter et réappairer', 'Disconnetti e abbina di nuovo', 'Desligar e emparelhar de novo', 'Від’єднати й підключити знову', 'Отключить и подключить заново'],
    opt_float: ['Duszek na wszystkich ekranach', 'Pet on every screen', 'Haustier auf allen Bildschirmen', 'Mascota en todas las pantallas', 'Compagnon sur tous les écrans', 'Amico su tutte le schermate', 'Bichinho em todos os ecrãs', 'Улюбленець на всіх екранах', 'Питомец на всех экранах'],
    opt_talk: ['Duszek gada sam z siebie', 'Pet talks on its own', 'Haustier redet von allein', 'La mascota habla sola', 'Le compagnon parle tout seul', 'L’amico parla da solo', 'O bichinho fala sozinho', 'Улюбленець говорить сам', 'Питомец говорит сам'],
    opt_vibe: ['Wibracje', 'Vibration', 'Vibration', 'Vibración', 'Vibrations', 'Vibrazione', 'Vibração', 'Вібрація', 'Вибрация'],
    set_foot: ['Claude Pocket · limity i terminal łączą się tylko z Twoim komputerem.', 'Claude Pocket · limits and terminal connect only to your own computer.', 'Claude Pocket · Limits und Terminal verbinden sich nur mit deinem Computer.', 'Claude Pocket · los límites y el terminal solo se conectan a tu ordenador.', 'Claude Pocket · limites et terminal ne se connectent qu’à votre ordinateur.', 'Claude Pocket · limiti e terminale si collegano solo al tuo computer.', 'Claude Pocket · os limites e o terminal só se ligam ao seu computador.', 'Claude Pocket · ліміти й термінал з’єднуються лише з вашим комп’ютером.', 'Claude Pocket · лимиты и терминал подключаются только к вашему компьютеру.'],

    // ---------- zakładki ----------
    tab_limits: ['Limity', 'Limits', 'Limits', 'Límites', 'Limites', 'Limiti', 'Limites', 'Ліміти', 'Лимиты'],
    tab_term: ['Terminal', 'Terminal', 'Terminal', 'Terminal', 'Terminal', 'Terminale', 'Terminal', 'Термінал', 'Терминал'],
    tab_pet: ['Duszek', 'Pet', 'Haustier', 'Mascota', 'Compagnon', 'Amico', 'Bichinho', 'Улюбленець', 'Питомец'],
    tab_set: ['Ustawienia', 'Settings', 'Einstellungen', 'Ajustes', 'Réglages', 'Impostazioni', 'Definições', 'Налаштування', 'Настройки'],

    // ---------- postacie i jedzenie ----------
    skin_ghost: ['Duszek', 'Ghost', 'Geist', 'Fantasma', 'Fantôme', 'Fantasma', 'Fantasma', 'Привид', 'Призрак'],
    skin_robot: ['Robocik', 'Robot', 'Roboter', 'Robot', 'Robot', 'Robot', 'Robô', 'Робот', 'Робот'],
    skin_gem: ['Kryształek', 'Gem', 'Kristall', 'Gema', 'Cristal', 'Gemma', 'Cristal', 'Кристалик', 'Кристаллик'],
    skin_fox: ['Lisek', 'Fox', 'Fuchs', 'Zorro', 'Renard', 'Volpe', 'Raposa', 'Лисичка', 'Лисёнок'],
    skin_cat: ['Kotek', 'Cat', 'Katze', 'Gato', 'Chat', 'Gatto', 'Gato', 'Котик', 'Котик'],
    food_cookie: ['Ciastko', 'Cookie', 'Keks', 'Galleta', 'Biscuit', 'Biscotto', 'Bolacha', 'Печиво', 'Печенье'],
    food_pizza: ['Pizza', 'Pizza', 'Pizza', 'Pizza', 'Pizza', 'Pizza', 'Piza', 'Піца', 'Пицца'],
    food_strawberry: ['Truskawka', 'Strawberry', 'Erdbeere', 'Fresa', 'Fraise', 'Fragola', 'Morango', 'Полуниця', 'Клубника'],
    food_donut: ['Pączek', 'Donut', 'Donut', 'Dónut', 'Beignet', 'Ciambella', 'Donut', 'Пончик', 'Пончик'],
    food_sushi: ['Sushi', 'Sushi', 'Sushi', 'Sushi', 'Sushi', 'Sushi', 'Sushi', 'Суші', 'Суши'],
    food_icecream: ['Lody', 'Ice cream', 'Eis', 'Helado', 'Glace', 'Gelato', 'Gelado', 'Морозиво', 'Мороженое'],
    food_fish: ['Rybka', 'Fish', 'Fisch', 'Pescado', 'Poisson', 'Pesce', 'Peixe', 'Рибка', 'Рыбка'],
    food_battery: ['Bateria', 'Battery', 'Batterie', 'Batería', 'Pile', 'Batteria', 'Bateria', 'Батарейка', 'Батарейка'],
    food_drumstick: ['Udko', 'Drumstick', 'Keule', 'Muslo', 'Pilon', 'Coscia', 'Coxa', 'Ніжка', 'Ножка'],
    food_candy: ['Cukierek', 'Candy', 'Bonbon', 'Caramelo', 'Bonbon', 'Caramella', 'Rebuçado', 'Цукерка', 'Конфета'],
  };

  const guess = () => {
    const nav = (navigator.languages || [navigator.language || 'en']).map(l => String(l).slice(0, 2).toLowerCase());
    return nav.find(c => CODES.includes(c)) || 'en';
  };
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('cp.lang')); } catch (e) { /* brak */ }
  let lang = CODES.includes(saved) ? saved : guess();
  let idx = CODES.indexOf(lang);

  function t(key, vars) {
    const row = T[key];
    let s = row ? (row[idx] ?? row[1] ?? row[0]) : key;
    if (vars) for (const k in vars) s = s.split(`{${k}}`).join(vars[k]);
    return s;
  }
  function apply(root = document) {
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  }
  function set(code) {
    if (!CODES.includes(code)) return;
    lang = code; idx = CODES.indexOf(code); saved = code;
    try { localStorage.setItem('cp.lang', JSON.stringify(code)); } catch (e) { /* brak miejsca */ }
    apply();
  }
  return { LANGS, t, apply, set, chosen: () => saved != null, get lang() { return lang; } };
})();
window.t = window.I18N.t;
