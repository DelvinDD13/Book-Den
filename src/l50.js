// ===== L50: Encyclopedia data — The First Law. tbi = The Blade Itself, btah = Before They Are Hanged, laok = Last Argument of Kings,
// bsc = Best Served Cold; book:0 = started, a bare key = finished. He has finished the trilogy; Best Served Cold is in progress,
// so only its opening is open and the rest waits for the end. Facts are checked against the pages in src.
(function () { if (!window.L29) return;
  L29.add({ k: 'firstlaw', n: 'The First Law', short: 'First Law', world: 'The Circle of the World', by: 'Joe Abercrombie', skin: 'steel', spines: ['#2b2b2e', '#7a1f1f', '#8c7a4b', '#3f4a3c', '#5a5f66'], acc: '#c9a227', hue: ['#26211a', '#0b0a09'], badge: 'Still Breathing',
    about: [['', "The Circle of the World, a world like early modern Europe. The Union is forever at war: a war with the Northmen is coming, and the Gurkish Empire presses it in the south. Magic is fading and few still believe in it. Bayaz, the First of the Magi, is back."]],
    src: [['TV Tropes, The First Law characters', 'https://tvtropes.org/pmwiki/pmwiki.php/Characters/TheFirstLawTheFirstLaw'], ['The First Law Wiki, The First Law Trilogy', 'https://firstlaw.fandom.com/wiki/The_First_Law_Trilogy'],
      ['Books That Slay, Best Served Cold', 'https://booksthatslay.com/best-served-cold-summary-characters-and-themes/']],
    books: [
      { k: 'tbi', t: 'The Blade Itself', sp: 'The Blade Itself', m: '^The Blade Itself' },
      { k: 'btah', t: 'Before They Are Hanged', sp: 'Before They Are Hanged', m: '^Before They Are Hanged' },
      { k: 'laok', t: 'Last Argument of Kings', sp: 'Last Argument of Kings', m: '^Last Argument of Kings' },
      { k: 'bsc', t: 'Best Served Cold', sp: 'Best Served Cold', m: '^Best Served Cold' }],
    cats: { union: 'The Union', north: 'The North', magi: 'Magi & lore', styria: 'Styria', places: 'Places' },
    e: [
      // ---------- the Union ----------
      { id: 'glokta', n: 'Sand dan Glokta', c: 'union', o: 1, g: 'tbi:0', t: [['tbi:0', 'Inquisitor'], ['laok', 'Arch Lector']], rel: ['sult', 'practicals', 'ardee', 'bayaz'], s: [
        ['tbi:0', "A war hero until the Gurkish captured and tortured him. Crippled, he now works for the Inquisition as a torturer."],
        ['laok', "He carries a sword cane and kills Frost with it. He ends the trilogy as Arch Lector, the man who speaks for Bayaz, and marries Ardee West to protect her and her child."]] },
      { id: 'jezal', n: 'Jezal dan Luthar', c: 'union', o: 2, g: 'tbi:0', t: [['tbi:0', "Captain, the King's Own"], ['laok', 'King']], rel: ['bayaz', 'west', 'ardee', 'terez'], s: [
        ['tbi:0', "A rich young nobleman and a captain in the King's Own, and a fine swordsman."],
        ['tbi', "He would have lost the final of the Contest without Bayaz's help."],
        ['laok', "After the deaths of King Guslav's heirs he is raised to the throne. Bayaz tells him privately that he is the bought son of a prostitute, one of several princes kept in reserve, and keeps him as a puppet king. He grows from a vain, selfish young man into a king who cares about his people."]] },
      { id: 'west', n: 'Collem West', c: 'union', o: 3, g: 'tbi:0', t: [['tbi:0', "Major, the King's Own"], ['laok', 'Lord Marshal']], rel: ['ardee', 'jezal'], s: [
        ['tbi:0', "A lowborn major in the King's Own."],
        ['laok', "He rises to Lord Marshal. The Northmen call him Furious after he goes berserk in battle."]] },
      { id: 'ardee', n: 'Ardee West', c: 'union', o: 4, g: 'tbi', t: [['tbi', "Collem's sister"]], rel: ['west', 'glokta', 'jezal'], s: [
        ['tbi', "Collem West's sister, a country girl."],
        ['laok', "At the end she marries Glokta to protect herself and her child."]] },
      { id: 'sult', n: 'Arch Lector Sult', c: 'union', o: 5, g: 'tbi:0', t: [['tbi:0', 'Head of the Inquisition']], rel: ['glokta', 'practicals', 'bayaz'], s: [
        ['tbi:0', "The head of the Inquisition, and Glokta's master."],
        ['laok', "He is a pawn of Bayaz. At the end Glokta takes him prisoner."]] },
      { id: 'practicals', n: 'Frost and Severard', c: 'union', o: 6, g: 'tbi:0', t: [['tbi:0', "Glokta's Practicals"]], rel: ['glokta', 'sult'], s: [
        ['tbi:0', "Practicals who work for Glokta: Frost, an albino with a lisp, and Severard, who loves knives."],
        ['laok', "Frost is Sult's mole. Severard is forced to betray Glokta, and Frost kills him; Glokta kills Frost."]] },
      { id: 'terez', n: 'Terez', c: 'union', o: 7, g: 'laok', t: [['laok', 'Queen']], rel: ['jezal'], s: [
        ['laok', "Jezal's wife and queen."]] },
      { id: 'carlot', n: 'Carlot dan Eider', c: 'union', o: 8, g: 'tbi', t: [['tbi', 'Magister']], rel: [], s: [
        ['tbi', "A merchant and Magister who is drawn deeper into compromise as the trilogy goes on."]] },
      // ---------- the North ----------
      { id: 'logen', n: 'Logen Ninefingers', c: 'north', o: 1, g: 'tbi:0', t: [['tbi:0', 'The Bloody-Nine']], rel: ['dogman', 'threetrees', 'bethod', 'bayaz', 'ferro'], s: [
        ['tbi:0', "An aging Northman. In a fight he can become the Bloody-Nine, a berserk state in which he kills friends and enemies alike."],
        ['tbi', "He carries the Maker's Sword."],
        ['laok', "He kills Tul Duru in a Bloody-Nine blackout at the battle of the High Places, and he kills Fenris the Feared by stabbing his left side."]] },
      { id: 'dogman', n: 'The Dogman', c: 'north', o: 2, g: 'tbi:0', t: [['tbi:0', 'Scout']], rel: ['logen', 'threetrees', 'grim'], s: [
        ['tbi:0', "Logen's oldest friend, a scout with a keen nose and sharp teeth."],
        ['tbi', "After Forley dies he thinks of himself as a coward."]] },
      { id: 'threetrees', n: 'Rudd Threetrees', c: 'north', o: 3, g: 'tbi', t: [['tbi', 'Named Man']], rel: ['logen', 'dogman', 'feared'], s: [
        ['tbi', "Logen's second, a respected Named Man. When Logen is thought dead, he leads the crew."],
        ['laok', "He dies fighting Fenris the Feared."]] },
      { id: 'grim', n: 'Harding Grim', c: 'north', o: 4, g: 'tbi', t: [['tbi', 'Named Man']], rel: ['dogman'], s: [
        ['tbi', "A Named Man of very few words and a fine archer. He speaks the Union's tongue."]] },
      { id: 'tul', n: 'Tul Duru Thunderhead', c: 'north', o: 5, g: 'tbi', t: [['tbi', 'Named Man']], rel: ['logen'], s: [
        ['tbi', "A giant of a Named Man who swings a huge sword."]] },
      { id: 'dow', n: 'Black Dow', c: 'north', o: 6, g: 'tbi', t: [['tbi', 'Named Man']], rel: ['logen'], s: [
        ['tbi', "A cruel Named Man with a missing ear."],
        ['laok', "He betrays Logen and takes the Maker's Sword."]] },
      { id: 'forley', n: 'Forley the Weakest', c: 'north', o: 7, g: 'tbi', t: [['tbi', 'Named Man']], rel: ['dogman', 'bethod'], s: [
        ['tbi', "Forley the Weakest volunteers to warn the North about the Shanka, and Calder kills him."]] },
      { id: 'bethod', n: 'Bethod', c: 'north', o: 8, g: 'tbi:0', t: [['tbi:0', 'King of the Northmen']], rel: ['logen', 'feared', 'bayaz'], s: [
        ['tbi:0', "The first King of the Northmen, a clever strategist, and once Logen's master."],
        ['laok', "He made deals with Bayaz and with the Shanka."]] },
      { id: 'feared', n: 'Fenris the Feared', c: 'north', o: 9, g: 'btah', t: [['btah', "Bethod's champion"]], rel: ['bethod', 'logen', 'threetrees'], s: [
        ['btah', "Bethod's champion, a giant who can hardly be hurt. His left side is covered in demonic writing."]] },
      // ---------- Magi & lore ----------
      { id: 'bayaz', n: 'Bayaz', c: 'magi', o: 1, g: 'tbi:0', t: [['tbi:0', 'First of the Magi']], rel: ['quai', 'jezal', 'logen', 'ferro', 'glokta', 'juvens'], s: [
        ['tbi:0', "The First of the Magi, back after centuries away."],
        ['btah', "He was Juvens's apprentice. When Kanedias killed Juvens, Bayaz swore vengeance, gathered the Magi and made war on Kanedias, who died in it."],
        ['laok', "He has been steering events from behind the scenes all along, under names that include Valint and Balk, and at the end he shows what he is."]] },
      { id: 'ferro', n: 'Ferro Maljinn', c: 'magi', o: 2, g: 'tbi', t: [['tbi', 'Escaped slave']], rel: ['bayaz', 'logen'], s: [
        ['tbi', "An escaped slave from Gurkhul and a feared rebel, with demon blood. She is an uncanny archer, rarely sleeps, and hisses when she is angry."]] },
      { id: 'quai', n: 'Malacus Quai', c: 'magi', o: 3, g: 'tbi', t: [['tbi', "Bayaz's apprentice"]], rel: ['bayaz'], s: [
        ['tbi', "Bayaz's apprentice."],
        ['laok', "The real Quai was already dead. The one who traveled with them was a shapeshifter who had killed and replaced him."]] },
      { id: 'yulwei', n: 'Yulwei', c: 'magi', o: 4, g: 'tbi', t: [['tbi', 'One of the Magi']], rel: ['bayaz', 'ferro'], s: [
        ['tbi', "One of the Magi."]] },
      { id: 'longfoot', n: 'Brother Longfoot', c: 'magi', o: 5, g: 'btah', t: [['btah', 'Navigator']], rel: ['bayaz'], s: [
        ['btah', "A boastful Navigator who guides Bayaz's journey."]] },
      { id: 'juvens', n: 'Euz and his sons', c: 'magi', o: 6, g: 'btah', t: [['btah', 'The old story']], rel: ['bayaz', 'khalul'], s: [
        ['btah', "Euz, half human and half demon, banished the demons to the Other Side and gave gifts to his three eldest sons: Juvens the High Art, which bends the laws of the world; Kanedias Making; Bedesh the speech of spirits. Glustrod, the fourth, got only a blessing. Jealous, he studied forbidden magic, found the Seed with the demons' help and raised an army of demon-bloods; his war destroyed the Old Empire and Glustrod with it."],
        ['btah', "Juvens built the Old Empire and taught twelve apprentices, the Order of the Magi."]] },
      { id: 'khalul', n: 'Khalul', c: 'magi', o: 7, g: 'btah', t: [['btah', 'A Magus']], rel: ['juvens', 'bayaz'], s: [
        ['btah', "The one Magus who refused to join Bayaz's war on Kanedias. He made the Eaters."]] },
      { id: 'magic', n: 'Magic', c: 'magi', o: 8, g: 'tbi:0', t: [['tbi:0', 'Fading']], rel: ['juvens'], s: [
        ['tbi:0', "Magic was once a great force in the world. It is fading, and most people no longer believe in it."]] },
      // ---------- places ----------
      { id: 'circle', n: 'The Circle of the World', c: 'places', o: 1, g: 'tbi:0', t: [['tbi:0', 'The world']], rel: ['unionland', 'northland', 'gurkhul', 'styrialand'], s: [
        ['tbi:0', "The world of the books, something like early modern Europe."]] },
      { id: 'unionland', n: 'The Union', c: 'places', o: 2, g: 'tbi:0', t: [['tbi:0', 'The central realm']], rel: ['jezal', 'glokta', 'west'], s: [
        ['tbi:0', "The central realm, almost always at war, with a government that barely works and a proud foreign policy."]] },
      { id: 'northland', n: 'The North', c: 'places', o: 3, g: 'tbi:0', t: [['tbi:0', 'The Northmen']], rel: ['logen', 'bethod'], s: [
        ['tbi:0', "Home of the Northmen, a rough alliance of warlike tribes. War with the Union is coming."]] },
      { id: 'gurkhul', n: 'The Gurkish Empire', c: 'places', o: 4, g: 'tbi:0', t: [['tbi:0', 'The south']], rel: ['glokta', 'ferro', 'khalul'], s: [
        ['tbi:0', "The empire in the hot south. It captured and tortured Glokta, and Ferro escaped its slavery."],
        ['btah', "It fights the Union over the city of Dagoska."]] },
      // ---------- Styria (Best Served Cold) ----------
      { id: 'styrialand', n: 'Styria', c: 'styria', o: 1, g: '', t: [['', 'City-states at war']], rel: ['monza', 'orso'], s: [
        ['', "A land of city-states, at war for nineteen years when Best Served Cold begins."]] },
      { id: 'monza', n: 'Monza Murcatto', c: 'styria', o: 2, g: '', t: [['', 'Mercenary commander']], rel: ['benna', 'orso', 'cosca', 'shivers'], s: [
        ['', "The most feared mercenary in Duke Orso's pay. He betrays her, and she sets out for revenge."],
        ['bsc:0', "Hard, disciplined and practical. When their father died of fever she took on the farm and her brother Benna, and she has protected him ever since. Nicomo Cosca drew them into mercenary work."],
        ['bsc:0', "At Orso's fortress of Fontezarmo his men kill Benna and throw her from the terrace. She lives, and sets out to kill the seven men who did it."]] },
      { id: 'benna', n: 'Benna Murcatto', c: 'styria', o: 3, g: 'bsc:0', t: [['bsc:0', "Monza's brother"]], rel: ['monza'], s: [
        ['bsc:0', "Monza's brother: charming, vain and careless."]] },
      { id: 'orso', n: 'Duke Orso', c: 'styria', o: 4, g: '', t: [['', "Monza's employer"]], rel: ['monza', 'seven'], s: [
        ['', "The duke Monza fights for, who betrays her."],
        ['bsc:0', "His captains' victories have brought him close to ruling all of Styria, and Monza's popularity frightens him."]] },
      { id: 'seven', n: 'The seven', c: 'styria', o: 5, g: 'bsc:0', t: [['bsc:0', "Monza's list"]], rel: ['monza', 'orso'], s: [
        ['bsc:0', "At Fontezarmo: Prince Ario stabs Benna, General Ganmark finishes him, Faithful Carpi holds Monza down and Gobba tries to strangle her, on Duke Orso's order."],
        ['bsc', "The full list: Gobba, Orso's bodyguard; Mauthis, Orso's banker at Valint and Balk; Faithful Carpi; General Ganmark; Prince Ario; Count Foscar; and Duke Orso himself."]] },
      { id: 'shivers', n: 'Caul Shivers', c: 'styria', o: 6, g: 'bsc:0', t: [['bsc:0', 'A Northman in the south']], rel: ['monza'], s: [
        ['bsc:0', "A Northman who came south hoping to become a better man, and found poverty and danger."]] },
      { id: 'cosca', n: 'Nicomo Cosca', c: 'styria', o: 7, g: 'bsc:0', t: [['bsc:0', 'Captain of the Company of the Sun']], rel: ['monza'], s: [
        ['bsc:0', "Captain of the Company of the Sun, the mercenary who brought Monza and Benna into the trade."]] },
      { id: 'crew', n: "Monza's crew", c: 'styria', o: 8, g: 'bsc', t: [['bsc', 'Hired for the revenge']], rel: ['monza', 'shivers'], s: [
        ['bsc', "Shivers, hired for the revenge; Castor Morveer, a poisoner, and his assistant Day; and Friendly, a former prisoner, brought in through Sajaam."]] }
    ],
    trees: [],
    charts: [
      { id: 'pov', n: 'Who tells the trilogy', g: 'tbi:0', type: 'cards', note: 'The trilogy follows six points of view.', items: [
          { n: 'Logen Ninefingers', sub: 'The North', lines: [['tbi:0', 'A Northman with a past.']] }, { n: 'Sand dan Glokta', sub: 'The Inquisition', lines: [['tbi:0', 'A torturer who was a hero.']] },
          { n: 'Jezal dan Luthar', sub: "The King's Own", lines: [['tbi:0', 'A nobleman with a sword.']] }, { n: 'Collem West', sub: "The King's Own", lines: [['tbi:0', 'A lowborn officer.']] },
          { n: 'Ferro Maljinn', sub: 'Out of Gurkhul', lines: [['tbi', 'An escaped slave.']] }, { n: 'The Dogman', sub: 'The North', lines: [['tbi:0', "Logen's oldest friend."]] }] }
    ]
  });
})();
