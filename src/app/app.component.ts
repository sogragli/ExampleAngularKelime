import { Component } from '@angular/core';
import { DictionaryService } from './dictionary.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  word: string = ''; 
  definitions: any = [];  
  nounExamples: string[] = []; 
  synonyms: string[] = []; 
  phonetic: string | null = null; 
  phoneticAudioUrl: string | null = null;
  isInputShrunk: boolean = false;  
  showResults: boolean = false; 
  errorMessage: string | null = null; 

  constructor(private dictionaryService: DictionaryService) {}

  searchWord() {
    if (this.word) {
      this.isInputShrunk = true; // Input alanını küçült
      this.dictionaryService.getWordDefinition(this.word).subscribe(
        (response) => {
          this.definitions = response;  // API’den gelen tanımları definitions değişkenine atar
          this.nounExamples = this.extractNounExamples(response); 
          this.synonyms = this.extractSynonyms(response);
          this.phonetic = this.extractPhonetic(response);
          this.phoneticAudioUrl = this.extractPhoneticAudioUrl(response); 
          this.showResults = true; 
          this.errorMessage = null; 
        },
        () => {
          this.definitions = [];  
          this.nounExamples = []; 
          this.synonyms = []; 
          this.phonetic = null; 
          this.phoneticAudioUrl = null; 
          this.showResults = false; 
          this.errorMessage = 'Kelime bulunamadı. Lütfen tekrar deneyin.'; // Hata mesajı
        }
      );
    } else {
      this.isInputShrunk = false; 
      this.definitions = [];
      this.nounExamples = []; 
      this.synonyms = []; 
      this.phonetic = null; 
      this.phoneticAudioUrl = null; 
      this.showResults = false; 
      this.errorMessage = null; 
    }
  }

  private extractNounExamples(response: any): string[] {
    const nounExamples: string[] = []; // Noun örneklerini dizi
    if (response && response.length > 0) {
      const meanings = response[0]?.meanings; 
      for (let meaning of meanings) {
        if (meaning.partOfSpeech === 'noun') { 
          if (meaning.definitions && meaning.definitions.length > 0) {
            for (let definition of meaning.definitions) {
              if (definition.example) {
                nounExamples.push(definition.example); // example anahtarı üzerinden örneği ekle
              }
            }
          }
        }
      }
    }
    return nounExamples; // Noun örneklerini döndür
  }

  private extractSynonyms(response: any): string[] {
    const synonyms: string[] = []; // Eş anlamlıları için dizi
    if (response && response.length > 0) {
      const meanings = response[0]?.meanings; // İlk anlamı al
      for (let meaning of meanings) {
        if (meaning.definitions && meaning.definitions.length > 0) {
          for (let definition of meaning.definitions) {
            if (definition.synonyms && definition.synonyms.length > 0) {
              synonyms.push(...definition.synonyms); // Eş anlamlıları ekle
            }
          }
        }
      }
    }
    return [...new Set(synonyms)]; // Tekrar eden eş anlamlıları kaldır
  }

  // Yeni fonksiyon: API'den phonetic değerini çek
  private extractPhonetic(response: any): string | null {
    if (response && response.length > 0) {
      return response[0]?.phonetic || null; // Phonetic değerini al
    }
    return null;
  }

  // Yeni fonksiyon: API'den sesli telaffuz URL'sini al
  private extractPhoneticAudioUrl(response: any): string | null {
    if (response && response.length > 0) {
      return response[0]?.phonetics[0]?.audio || null; // Sesli telaffuz URL'sini al
    }
    return null;
  }
}
