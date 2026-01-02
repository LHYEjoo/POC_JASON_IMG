# Preprompts Setup Gids

## Overzicht

Dit systeem ondersteunt verschillende paden voor het beantwoorden van vragen:

1. **Voorgestelde Vragen (Nederlands)**: Gebruik vooraf gegenereerde antwoorden met vooraf gegenereerde audio van Supabase
2. **Voorgestelde Vragen (Engels)**: Gebruik vooraf gegenereerde antwoorden maar genereer TTS on-the-fly (geen vooraf gegenereerde audio)
3. **Unieke Vragen**: Gebruik altijd RAG + TTS on-the-fly

## Setup Stappen

### 0. Maak Database Tabel aan

**BELANGRIJK**: Voer eerst het SQL schema uit in Supabase voordat je de migratie uitvoert!

1. Ga naar je Supabase project dashboard
2. Navigeer naar **SQL Editor**
3. Open het bestand `supabase/preprompts_schema.sql`
4. Kopieer de volledige SQL code
5. Plak en voer uit in de SQL Editor

Dit maakt de `suggested_questions_preprompts` tabel aan met alle benodigde kolommen, indexen, triggers en RLS policies.

**Alternatief**: Als je Supabase CLI gebruikt:
```bash
supabase db push
```

### 1. Migreer Preprompts naar Database

Voer het migratiescript uit om Nederlandse preprompts van `suggestedQuestions.ts` naar Supabase te verplaatsen:

```bash
npm run migrate-preprompts
```

Dit zal:
- Alle vragen uit `suggestedQuestions.ts` lezen
- Zowel Nederlandse (nl) als Engelse (en) preprompts extraheren
- Invoegen in Supabase `suggested_questions_preprompts` tabel
- `audioUrl` op `null` zetten voor alle (Nederlands wordt bijgewerkt na upload, Engels blijft null)

### 2. Maak Mappenstructuur aan in Supabase Storage (Optioneel)

**Je kunt deze stap overslaan** als je direct bestanden uploadt met het volledige pad (zie Stap 3). Het script is alleen handig als je de mappenstructuur eerst wilt aanmaken.

**Voor alle vragen tegelijk:**
```bash
npm run create-storage-folders
```

**Voor één specifieke vraag:**
```bash
npm run create-storage-folders <questionId>
```

**Voorbeelden:**
```bash
npm run create-storage-folders taiwan-domestic-matter
npm run create-storage-folders peaceful-reunification
```

Dit maakt de mappenstructuur aan: `preprompts/{questionId}/nl/`

**Let op**: Supabase Storage heeft geen echte mappen - je ziet ze mogelijk niet in de UI, maar je kunt wel bestanden uploaden met het volledige pad (zie Stap 3).

### 3. Upload Audio Bestanden naar Supabase Storage (Alleen Nederlands)

Upload handmatig audio bestanden naar Supabase Storage voor **alleen Nederlandse preprompts**:

**Waar vind je Storage in Supabase?**
1. Ga naar je Supabase project dashboard
2. Klik in het linker menu op **Storage** (onder "Database" en "Authentication")
3. Je ziet een lijst met "Buckets" - zoek naar de bucket genaamd `audio`
4. Als de bucket niet bestaat, klik op **"New bucket"** en maak een bucket genaamd `audio` aan (maak deze **publiek**)
5. Klik op de `audio` bucket om deze te openen

**Storage Bucket**: `audio`  
**Mapstructuur**: `preprompts/{questionId}/nl/burst-{index}.mp3`

**Hoe upload je bestanden per vraag?**

**Belangrijk**: Supabase Storage heeft geen echte "mappen" zoals een bestandssysteem. Het gebruikt bestandspaden. Je hoeft de mappen niet te zien - je kunt direct bestanden uploaden met het volledige pad.

**Stap-voor-stap per vraag:**

1. **Bepaal de questionId** van de vraag waar je audio voor wilt uploaden
   - Bijvoorbeeld: `taiwan-domestic-matter`, `peaceful-reunification`, etc.
   - Je vindt alle questionIds in `src/config/suggestedQuestions.ts`

2. **Upload de 3 MP3 bestanden** met het volledige pad:
   - Ga naar je `audio` bucket in Supabase Storage
   - Klik op **"Upload file"** of **"New file"**
   - Geef bij elk bestand het volledige pad op in het pad-veld:
     - `preprompts/{questionId}/nl/burst-0.mp3`
     - `preprompts/{questionId}/nl/burst-1.mp3`
     - `preprompts/{questionId}/nl/burst-2.mp3`

**Voorbeeld voor één vraag (`taiwan-domestic-matter`):**
```
Upload bestand 1:
  Pad: preprompts/taiwan-domestic-matter/nl/burst-0.mp3
  Bestand: je-audio-bestand-0.mp3

Upload bestand 2:
  Pad: preprompts/taiwan-domestic-matter/nl/burst-1.mp3
  Bestand: je-audio-bestand-1.mp3

Upload bestand 3:
  Pad: preprompts/taiwan-domestic-matter/nl/burst-2.mp3
  Bestand: je-audio-bestand-2.mp3
```

**Belangrijk**: 
- De bestandsnamen in het pad moeten exact zijn: `burst-0.mp3` (niet `burst_0.mp3` of `Burst-0.mp3`)
- Het pad moet exact zijn: `preprompts/{questionId}/nl/burst-{index}.mp3`
- Je kunt de mappen niet zien in de UI, maar de bestanden worden wel op het juiste pad opgeslagen

**Na het uploaden van alle vragen:**
- Voer `npm run update-audio-urls` uit om de database bij te werken met de audio URLs

**Hoe weet je welke vraag bij welke questionId hoort?**

Voer dit commando uit om een overzicht te zien van alle vragen met hun IDs en teksten:

```bash
npm run list-questions
```

Dit toont:
- Alle questionIds
- De volledige vraagtekst (Nederlands en Engels)
- Tags
- Het juiste Storage pad voor audio uploads

**Voorbeeld output:**
```
1. Question ID: taiwan-domestic-matter
   Nederlands: China noemt Taiwan een 'binnenlandse aangelegenheid'...
   English: China calls Taiwan a "domestic matter"...
   Storage pad: preprompts/taiwan-domestic-matter/nl/burst-{0,1,2}.mp3
```

**Alle beschikbare questionIds (quick reference):**
- `taiwan-domestic-matter`
- `peaceful-reunification`
- `fear-deterrence-strategy`
- `national-security-law-pressure`
- `world-alertness-taiwan`
- `grey-zone-pressure`
- `cyberattacks-disinformation`
- `taiwan-vulnerability-infrastructure`
- `disinformation-basic-fears`
- `chip-industry-protection`
- `beijing-rhetoric-sovereignty`
- `activism-silence-safety`
- `protest-size-hongkong-taiwan`
- `return-hongkong`
- `danger-guilt-left-behind`
- `cut-contact-parents`
- `freedom-means-loss`
- `girlfriend-shared-fear`
- `military-exercises-online-threats`
- `how-safe-really`
- `message-to-taiwanese`

Je kunt deze IDs ook vinden in `src/config/suggestedQuestions.ts`.

**Voorbeeld**:
```
audio/
  preprompts/
    taiwan-domestic-matter/
      nl/
        burst-0.mp3
        burst-1.mp3
        burst-2.mp3
    peaceful-reunification/
      nl/
        burst-0.mp3
        burst-1.mp3
        burst-2.mp3
```

**Belangrijk**:
- Upload alleen audio voor Nederlandse (nl) preprompts
- Engelse preprompts hebben geen audio nodig (TTS wordt on-the-fly gegenereerd)
- Elke vraag heeft 3 bursts (index 0, 1, 2)
- Bestanden moeten MP3 formaat zijn
- Bestandsnaam moet exact overeenkomen: `burst-{index}.mp3`

**⚠️ Security Overweging:**
- **Publieke bucket**: Eenvoudig, maar iedereen met de URL kan de audio downloaden
- **Privé bucket met signed URLs**: Veiliger, maar vereist een backend endpoint om signed URLs te genereren
- Voor development/test: Publieke bucket is prima
- Voor productie: Overweeg privé bucket met signed URLs via een backend API endpoint

### 4. Werk Audio URLs bij in Database

Na het uploaden van audio bestanden, voer het updatescript uit:

```bash
npm run update-audio-urls
```

Dit zal:
- Supabase Storage scannen op audio bestanden
- Bestanden matchen met vragen op basis van padpatroon
- Database records bijwerken met publieke URLs
- Bestanden mappen naar correcte `question_id` en burst index

## Hoe Het Werkt

### Nederlandse Voorgestelde Vragen

1. Gebruiker klikt op een voorgestelde vraag (Nederlands)
2. Systeem controleert Supabase op preprompts
3. **Als preprompts gevonden met audio URLs**:
   - Speel vooraf gegenereerde audio direct af vanuit Storage
   - Toon berichten terwijl audio speelt
   - Geen TTS generatie nodig
4. **Als preprompts gevonden maar audio URLs ontbreken**:
   - Gebruik bestaande bursts met audio (indien aanwezig)
   - Genereer TTS on-the-fly voor ontbrekende bursts
   - Mix vooraf gegenereerde + on-the-fly audio
5. **Als preprompts niet gevonden**:
   - Valt terug op RAG pad (genereer antwoord + TTS)

### Engelse Voorgestelde Vragen

1. Gebruiker klikt op een voorgestelde vraag (Engels)
2. Systeem controleert Supabase op preprompts
3. **Als preprompts gevonden**:
   - Gebruik vooraf gegenereerde tekst uit database
   - Genereer TTS on-the-fly voor alle bursts (negeert audioUrl zelfs als aanwezig)
   - Toon berichten en audio gelijktijdig
4. **Als preprompts niet gevonden**:
   - Valt terug op RAG pad (genereer antwoord + TTS)

### Unieke Vragen

- Gebruik altijd RAG pad (genereer antwoord + TTS on-the-fly)

## Bestandsstructuur

### Database Schema

Tabel: `suggested_questions_preprompts`

```sql
{
  question_id: string,      -- Komt overeen met id uit suggestedQuestions.ts
  language: 'nl' | 'en',   -- Nederlandse of Engelse preprompts
  bursts: [
    {
      text: string,
      audioUrl: string | null,
      index: number
    }
  ],
  image_url: string | null,
  citations: string | null,
  full_text: string
}
```

### Storage Structuur

```
audio/
  preprompts/
    {questionId}/
      nl/
        burst-0.mp3
        burst-1.mp3
        burst-2.mp3
```

## Probleemoplossing

### Audio bestanden spelen niet af

1. Controleer of bestanden naar het juiste pad zijn geüpload
2. Verifieer dat Storage bucket publiek is
3. Voer `npm run update-audio-urls` uit om URLs te vernieuwen
4. Controleer browser console op fouten

### Preprompts niet gevonden

1. Voer `npm run migrate-preprompts` uit om database te vullen
2. Controleer Supabase database op records
3. Verifieer dat `question_id` exact overeenkomt

### Tabel niet gevonden (Could not find the table 'public.suggested_questions_preprompts')

**Dit betekent dat de database tabel nog niet bestaat!**

1. Voer eerst **Stap 0** uit: Maak Database Tabel aan
2. Open `supabase/preprompts_schema.sql` in Supabase SQL Editor
3. Voer het SQL script uit om de tabel aan te maken
4. Probeer daarna opnieuw: `npm run migrate-preprompts`

### Mappen niet zichtbaar in Supabase Storage UI

**Probleem**: Het script zegt dat mappen al bestaan, maar je ziet ze niet in de Supabase Storage UI.

**Oorzaak**: Supabase Storage heeft geen echte "mappen" zoals een bestandssysteem. Het gebruikt bestandspaden. Het script maakt een `.keep` placeholder bestand aan, maar deze zijn mogelijk niet zichtbaar als mappen in de UI.

**Oplossing**: 
1. Je hoeft de mappen niet te zien - je kunt direct bestanden uploaden met het volledige pad
2. Klik op **"Upload file"** in de `audio` bucket
3. Geef bij het uploaden het volledige pad op: `preprompts/{questionId}/nl/burst-{index}.mp3`
   - Bijvoorbeeld: `preprompts/taiwan-domestic-matter/nl/burst-0.mp3`
4. De bestanden worden opgeslagen op het juiste pad, ook al zie je de mappen niet in de UI

**Alternatief**: Je kunt ook gewoon bestanden uploaden zonder het pad-script te gebruiken. Upload direct met het volledige pad zoals hierboven beschreven.

### TTS wordt nog steeds gegenereerd voor Nederlands

1. Controleer of audio URLs zijn ingesteld in database
2. Verifieer dat audio bestanden bestaan in Storage
3. Voer `npm run update-audio-urls` uit om URLs bij te werken

### Security: Publieke vs Privé Bucket

**Huidige setup (Publieke bucket):**
- ✅ Eenvoudig te gebruiken
- ✅ Geen extra backend code nodig
- ⚠️ Iedereen met de URL kan audio downloaden
- ⚠️ Bestanden zijn direct toegankelijk zonder authenticatie

**Veiligere optie (Privé bucket met signed URLs):**
- ✅ Bestanden zijn niet direct toegankelijk
- ✅ URLs zijn tijdelijk (bijv. 1 uur geldig)
- ✅ Vereist authenticatie om URLs te genereren
- ⚠️ Vereist een backend endpoint of Supabase Edge Function om signed URLs te genereren
- ⚠️ Meer complexe setup

**Aanbeveling:**
- Voor **development/test**: Gebruik publieke bucket (huidige setup)
- Voor **productie**: Overweeg privé bucket met signed URLs als de audio content gevoelig is

**Om over te schakelen naar privé bucket:**
1. Maak de bucket privé in Supabase Storage settings
2. Maak een backend endpoint die signed URLs genereert (vereist service role key)
3. Pas `getPreprompts` aan om signed URLs dynamisch op te halen via het endpoint
4. Update `update-audio-urls.ts` om bestandspaden op te slaan in plaats van URLs

## Scripts Referentie

- `npm run list-questions` - Toon alle vragen met hun IDs en teksten (handig om te zien welke vraag bij welke ID hoort)
- `npm run migrate-preprompts` - Migreer preprompts van code naar database (vereist dat tabel bestaat!)
- `npm run create-storage-folders` - Maak automatisch mappenstructuur aan in Supabase Storage (optioneel: voeg questionId toe voor één vraag)
- `npm run update-audio-urls` - Werk database bij met audio URLs van Storage

## Database Schema Bestand

Het SQL schema bestand staat in: `supabase/preprompts_schema.sql`

Dit bestand moet worden uitgevoerd in Supabase SQL Editor voordat je de migratie kunt uitvoeren.
