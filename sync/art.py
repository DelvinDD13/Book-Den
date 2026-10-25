#!/usr/bin/env python3
"""Public-domain and openly licensed art for Book Den, downloaded once into art/ with a credits file.
Every file's licence is recorded in art/credits.json; CC BY items are credited in the app's credits panel."""
import json, os, io, urllib.request, urllib.parse
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'art'); os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'BookDen/1.0 (+https://delvindd13.github.io/Book-Den/; art fetch)'}
MAXPX = 1600
FP = lambda name, w=MAXPX: 'https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(name) + '?width=%d' % w
ITEMS = [
  # id, file on Commons, title, artist, licence, page
  ('hokusai-dragon', 'Hokusai_Dragon.jpg', 'Matsuri Yatai ceiling dragon (1844)', 'Katsushika Hokusai', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Hokusai_Dragon.jpg'),
  ('hokusai-fuji-dragon', 'Dragon_ascending_Mount_Fuji,_Katsushika_Hokusai.jpg', 'Dragon ascending Mount Fuji (1835)', 'Katsushika Hokusai', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Dragon_ascending_Mount_Fuji,_Katsushika_Hokusai.jpg'),
  ('rackham-fafnir', 'Siegfried_kills_Fafnir.jpg', 'Siegfried kills Fafnir (1911)', 'Arthur Rackham', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Siegfried_kills_Fafnir.jpg'),
  ('rackham-fafner-hoard', 'Siegfried_and_the_Twilight_of_the_Gods_p_022.jpg', 'In dragon\'s form Fafner now watches the hoard (1911)', 'Arthur Rackham', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Siegfried_and_the_Twilight_of_the_Gods_p_022.jpg'),
  ('rackham-sigurd', 'Sigurd_pierced_him_with_his_sword_(1901)_by_Arthur_Rackham.jpg', 'Sigurd pierced him with his sword (1901)', 'Arthur Rackham', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Sigurd_pierced_him_with_his_sword_(1901)_by_Arthur_Rackham.jpg'),
  ('dore-leviathan', 'Destruction_of_Leviathan.png', 'Destruction of Leviathan (1865)', 'Gustave Doré', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Destruction_of_Leviathan.png'),
  ('dore-lucifer', 'DVinfernoLuciferKingOfHell_m.jpg', 'Lucifer, King of Hell (Inferno XXXIV)', 'Gustave Doré', 'Public domain', 'https://commons.wikimedia.org/wiki/File:DVinfernoLuciferKingOfHell_m.jpg'),
  ('dore-dragon-divider', 'Gustave_Doré_-_dragon_page_column_separator.jpg', 'Dragon page column separator (1883)', 'Gustave Doré', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Gustave_Dor%C3%A9_-_dragon_page_column_separator.jpg'),
  ('nielsen-lindworm', 'Kay_Nielsen_-_East_of_the_sun_and_west_of_the_moon_-_She_saw_the_Lindworm_for_the_first_time.jpg', 'She saw the Lindworm for the first time (1914)', 'Kay Nielsen', 'Public domain (US)', 'https://commons.wikimedia.org/wiki/File:Kay_Nielsen_-_East_of_the_sun_and_west_of_the_moon_-_She_saw_the_Lindworm_for_the_first_time.jpg'),
  ('nielsen-wood', 'Illustration_by_Kay_Nielsen_2.jpg', 'Green patch in the gloomy wood (1914)', 'Kay Nielsen', 'Public domain (US)', 'https://commons.wikimedia.org/wiki/File:Illustration_by_Kay_Nielsen_2.jpg'),
  ('nielsen-battle', 'Kay_Nielsen_-_East_of_the_sun_and_west_of_the_moon_-_the_widow\'s_son-_the_Lad_in_the_Battle.jpg', 'The Lad in the Battle (1914)', 'Kay Nielsen', 'Public domain (US)', 'https://commons.wikimedia.org/wiki/File:Kay_Nielsen_-_East_of_the_sun_and_west_of_the_moon_-_the_widow%27s_son-_the_Lad_in_the_Battle.jpg'),
  ('chenrong-dragon', 'Chen_Rong_-_The_Dragon_-_23.142.1_-_Metropolitan_Museum_of_Art.jpg', 'The Dragon (Song dynasty)', 'Chen Rong, The Met', 'CC0', 'https://commons.wikimedia.org/wiki/File:Chen_Rong_-_The_Dragon_-_23.142.1_-_Metropolitan_Museum_of_Art.jpg'),
  ('waterhouse-circe', 'Circe_Offering_the_Cup_to_Odysseus_(2457_x_4023px_ed.).jpg', 'Circe Offering the Cup to Ulysses (1891)', 'John William Waterhouse', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Circe_Offering_the_Cup_to_Odysseus_(2457_x_4023px_ed.).jpg'),
  ('sosias-achilles', 'Akhilleus_Patroklos_Antikensammlung_Berlin_F2278.jpg', 'Achilles tending Patroclus, Sosias kylix (c. 500 BC)', 'photo: Bibi Saint-Pol', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Akhilleus_Patroklos_Antikensammlung_Berlin_F2278.jpg'),
  ('met-sword-ralgri', 'Sword_(Ral_gri)_MET_DP113247.jpg', 'Sword (Ral gri)', 'The Met', 'CC0', 'https://commons.wikimedia.org/wiki/File:Sword_(Ral_gri)_MET_DP113247.jpg'),
  ('met-sword-estoc', 'Sword_(Estoc)_MET_4952.jpg', 'Sword (Estoc)', 'The Met', 'CC0', 'https://commons.wikimedia.org/wiki/File:Sword_(Estoc)_MET_4952.jpg'),
  ('trinity-long-room', 'Dublin_Trinity_College_Library_Long_Room_01.jpg', 'Trinity College Library, Long Room', 'Zairon', 'CC BY 4.0', 'https://commons.wikimedia.org/wiki/File:Dublin_Trinity_College_Library_Long_Room_01.jpg'),
  ('long-room-1885', 'The_Long_Room_(6713554905).jpg', 'The Long Room, c. 1885', 'National Library of Ireland', 'No known copyright restrictions', 'https://commons.wikimedia.org/wiki/File:The_Long_Room_(6713554905).jpg'),
  ('admont-library', 'Stiftsbibliothek_Admont.jpg', 'Admont Abbey Library', 'LitterART', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Stiftsbibliothek_Admont.jpg'),
]
ICONS = [  # game-icons.net, CC BY 3.0 — author/icon
  ('delapouite', 'retro-controller'), ('lorc', 'dragon-head'), ('delapouite', 'biceps'), ('delapouite', 'book-cover'), ('delapouite', 'tv'), ('lorc', 'crossed-swords'), ('delapouite', 'weight-lifting-up'), ('lorc', 'spell-book'), ('delapouite', 'bookshelf'), ('lorc', 'dragon-spiral'), ('delapouite', 'joystick'), ('lorc', 'sword-brandish')]

def fetch(url):
    r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60); return r.read()

credits = []
for id_, fname, title, artist, lic, page in ITEMS:
    try:
        data = fetch(FP(fname)); im = Image.open(io.BytesIO(data)); im.load()
        if im.mode not in ('RGB', 'L'): im = im.convert('RGB')
        im.thumbnail((MAXPX, MAXPX)); p = os.path.join(OUT, id_ + '.jpg'); im.save(p, 'JPEG', quality=86, optimize=True)
        credits.append({'id': id_, 'title': title, 'artist': artist, 'license': lic, 'page': page, 'w': im.width, 'h': im.height})
        print('ok', id_, im.size, flush=True)
    except Exception as e:
        print('FAIL', id_, e, flush=True)
for author, icon in ICONS:
    try:
        svg = fetch('https://game-icons.net/icons/ffffff/000000/1x1/%s/%s.svg' % (author, icon))
        open(os.path.join(OUT, 'icon-' + icon + '.svg'), 'wb').write(svg)
        credits.append({'id': 'icon-' + icon, 'title': icon + ' icon', 'artist': author + ' (game-icons.net)', 'license': 'CC BY 3.0', 'page': 'https://game-icons.net/1x1/%s/%s.html' % (author, icon)})
        print('ok icon', icon, flush=True)
    except Exception as e:
        print('FAIL icon', icon, e, flush=True)
json.dump(credits, open(os.path.join(OUT, 'credits.json'), 'w'), indent=1)
print('credits', len(credits))
