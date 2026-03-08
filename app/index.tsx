import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import { useFonts, GamjaFlower_400Regular } from '@expo-google-fonts/gamja-flower';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const { width } = Dimensions.get('window');

const THEMES = [
  {
    id: 'thanks',
    label: '감사·기쁨 🌻',
    character: '�',
    bgColor: '#FFF0F5', // 고급스러운 라벤더 블러쉬
    verses: [
      '"항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라" (살전 5:16-18)',
      '"내 영혼아 여호와를 송축하며 그의 모든 은택을 잊지 말지어다" (시 103:2)',
      '"우리가 감사함으로 그 앞에 나아가며 시를 지어 즐거이 그를 노래하자" (시 95:2)'
    ],
  },
  {
    id: 'courage',
    label: '용기·격려 🦁',
    character: '🦁',
    bgColor: '#F0F8FF', // 깔끔한 앨리스 블루
    verses: [
      '"강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라" (수 1:9)',
      '"두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라" (사 41:10)',
      '"여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요" (시 27:1)'
    ],
  },
  {
    id: 'comfort',
    label: '위로·치유 🕊️',
    character: '�',
    bgColor: '#F5FFFA', // 따뜻하고 맑은 민트 크림
    verses: [
      '"수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라" (마 11:28)',
      '"여호와는 마음이 상한 자를 가까이 하시고 충심으로 통회하는 자를 구원하시는도다" (시 34:18)',
      '"너희 염려를 다 주께 맡기라 이는 그가 너희를 돌보심이라" (벧전 5:7)'
    ],
  },
  {
    id: 'peace',
    label: '평안·동행 🌿',
    character: '�',
    bgColor: '#FFF8E7', // 포근한 코스믹 라떼
    verses: [
      '"여호와는 나의 목자시니 내게 부족함이 없으리로다" (시 23:1)',
      '"평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라" (요 14:27)',
      '"볼지어다 내가 세상 끝날까지 너희와 항상 함께 있으리라" (마 28:20)'
    ],
  },
];

const DEFAULT_BGS = [
  require('@/assets/images/bible_bg_sheep.png'),
  require('@/assets/images/bible_bg_night.png'),
  require('@/assets/images/bible_bg_river.png'),
  require('@/assets/images/cute_bg_4.png'),
];

const BIBLE_BOOKS: Record<string, string> = {
  // 구약
  "창세기": "gen", "출애굽기": "exo", "레위기": "lev", "민수기": "num", "신명기": "deu",
  "여호수아": "jos", "사사기": "jdg", "룻기": "rut", "사무엘상": "1sa", "사무엘하": "2sa",
  "열왕기상": "1ki", "열왕기하": "2ki", "역대상": "1ch", "역대하": "2ch", "에스라": "ezr",
  "느헤미야": "neh", "에스더": "est", "욥기": "job", "시편": "psa", "잠언": "pro",
  "전도서": "ecc", "아가": "sng", "이사야": "isa", "예레미야": "jer", "예레미야애가": "lam",
  "에스겔": "ezk", "다니엘": "dan", "호세아": "hos", "요엘": "jol", "아모스": "amo",
  "오바댜": "oba", "요나": "jon", "미가": "mic", "나훔": "nam", "하박국": "hab",
  "스바냐": "zep", "학개": "hag", "스가랴": "zec", "말라기": "mal",
  // 신약
  "마태복음": "mat", "마가복음": "mrk", "누가복음": "luk", "요한복음": "jhn", "사도행전": "act",
  "로마서": "rom", "고린도전서": "1co", "고린도후서": "2co", "갈라디아서": "gal", "에베소서": "eph",
  "빌립보서": "php", "골로새서": "col", "데살로니가전서": "1th", "데살로니가후서": "2th",
  "디모데전서": "1ti", "디모데후서": "2ti", "디도서": "tit", "빌레몬서": "phm",
  "히브리서": "heb", "야고보서": "jas", "베드로전서": "1pe", "베드로후서": "2pe",
  "요한1서": "1jn", "요한2서": "2jn", "요한3서": "3jn", "유다서": "jud", "요한계시록": "rev",
  // 줄임말
  "창": "gen", "출": "exo", "레": "lev", "민": "num", "신": "deu",
  "수": "jos", "삿": "jdg", "룻": "rut", "삼상": "1sa", "삼하": "2sa",
  "왕상": "1ki", "왕하": "2ki", "대상": "1ch", "대하": "2ch", "스": "ezr",
  "느": "neh", "에": "est", "욥": "job", "시": "psa", "잠": "pro",
  "전": "ecc", "아": "sng", "사": "isa", "렘": "jer", "애": "lam",
  "겔": "ezk", "단": "dan", "호": "hos", "욜": "jol", "암": "amo",
  "옵": "oba", "욘": "jon", "미": "mic", "나": "nam", "합": "hab",
  "습": "zep", "학": "hag", "슥": "zec", "말": "mal",
  "마": "mat", "막": "mrk", "눅": "luk", "요": "jhn", "행": "act",
  "롬": "rom", "고전": "1co", "고후": "2co", "갈": "gal", "엡": "eph",
  "빌": "php", "골": "col", "살전": "1th", "살후": "2th",
  "딤전": "1ti", "딤후": "2ti", "딛": "tit", "몬": "phm",
  "히": "heb", "약": "jas", "벧전": "1pe", "벧후": "2pe",
  "요일": "1jn", "요이": "2jn", "요삼": "3jn", "유": "jud", "계": "rev",
  "마태": "mat", "마가": "mrk", "누가": "luk", "요한": "jhn"
};

export default function Index() {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [selectedVerse, setSelectedVerse] = useState(THEMES[0].verses[0]);
  const [isCustomVerse, setIsCustomVerse] = useState(false);
  const [customVerseText, setCustomVerseText] = useState('');
  const [customVerseRef, setCustomVerseRef] = useState('');

  const [selectedDefaultBg, setSelectedDefaultBg] = useState<any>(DEFAULT_BGS[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [message, setMessage] = useState('오늘도 평안한 하루 되세요 ✨');
  const [tapScale, setTapScale] = useState(1);
  const viewShotRef = useRef<ViewShot>(null);
  const isUserPickedBg = useRef(false);

  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [status, requestPermission] = MediaLibrary.usePermissions({ writeOnly: true });

  const [fontsLoaded] = useFonts({
    GamjaFlower: GamjaFlower_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const fetchBibleVerse = async () => {
    if (!customVerseRef.trim()) {
      Alert.alert('알림', '먼저 기록장칸에 구절(예: 이사야 44:1)을 적어주세요.');
      return;
    }

    const match = customVerseRef.replace(/\s+/g, '').match(/([가-힣0-9]+?)(\d+)장?[:_-]?(\d+(?:-\d+)?).*$/);

    if (!match) {
      Alert.alert('알림', '성경 구절 양식이 맞지 않습니다. "이사야 44:1", "요3:16"과 같이 입력 후 불러오기를 눌러주세요.');
      return;
    }

    let [_, bookName, chapter, verse] = match;
    const bookCode = BIBLE_BOOKS[bookName];

    if (!bookCode) {
      Alert.alert('알림', `'${bookName}' 성경을 찾을 수 없습니다. (예: 이사야, 요한복음)`);
      return;
    }

    setIsLoadingVerse(true);
    try {
      const url = `http://ibibles.net/quote.php?kor-${bookCode}/${chapter}:${verse}`;
      const response = await fetch(url);
      const htmlText = await response.text();

      const bodyMatch = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        let text = bodyMatch[1]
          .replace(/<small>.*?<\/small>/gi, '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .trim();

        if (text) {
          isUserPickedBg.current = false;
          setCustomVerseText(text);
        } else {
          Alert.alert('알림', '입력하신 구절을 찾을 수가 없습니다.');
        }
      } else {
        Alert.alert('오류', '성경 데이터를 불러오는 중 문제가 발생했습니다.');
      }
    } catch (e) {
      Alert.alert('오류', '인터넷 연결을 확인해주세요.');
    } finally {
      setIsLoadingVerse(false);
    }
  };

  const currentVerseToShow = isCustomVerse
    ? (customVerseText || customVerseRef)
      ? `${customVerseText}\n\n${customVerseRef ? `< ${customVerseRef} >` : ''}`
      : ''
    : selectedVerse;

  useEffect(() => {
    // 테마가 바뀔 때, 직접 입력 모드가 아니라면 첫 번째 성경 구절로 초기화
    if (!isCustomVerse) {
      isUserPickedBg.current = false;
      setSelectedVerse(selectedTheme.verses[0]);
    }
  }, [selectedTheme]);

  // 성경 말씀 내용에 따라 자동으로 적절한 배경 선택
  useEffect(() => {
    if (!currentVerseToShow || isUserPickedBg.current) return;

    const text = currentVerseToShow.toLowerCase();

    if (text.includes('목자') || text.includes('양') || text.includes('푸른') || text.includes('풀밭') || text.includes('인도') || text.includes('함께') || text.includes('담대')) {
      setSelectedDefaultBg(DEFAULT_BGS[0]);
    } else if (text.includes('밤') || text.includes('별') || text.includes('빛') || text.includes('어둠') || text.includes('자장') || text.includes('두려')) {
      setSelectedDefaultBg(DEFAULT_BGS[1]);
    } else if (text.includes('강') || text.includes('물') || text.includes('시냇가') || text.includes('숲') || text.includes('열매') || text.includes('은택') || text.includes('감사') || text.includes('기뻐')) {
      setSelectedDefaultBg(DEFAULT_BGS[2]);
    } else if (text.includes('하늘') || text.includes('새') || text.includes('비둘기') || text.includes('평안') || text.includes('위로') || text.includes('마음') || text.includes('쉬게')) {
      setSelectedDefaultBg(DEFAULT_BGS[3]);
    } else {
      let hash = 0;
      for (let i = 0; i < text.length; i++) hash += text.charCodeAt(i);
      setSelectedDefaultBg(DEFAULT_BGS[hash % DEFAULT_BGS.length]);
    }
  }, [currentVerseToShow]);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    });

    if (!result.canceled) {
      isUserPickedBg.current = true;
      setCustomImage(result.assets[0].uri);
      setSelectedDefaultBg(null);
    }
  };

  const handleSelectDefaultBg = (bg: any) => {
    isUserPickedBg.current = true;
    setCustomImage(null);
    setSelectedDefaultBg(bg);
  };

  const handleTapInteraction = () => {
    setTapScale(1.15);
    setTimeout(() => setTapScale(1), 200);
  };

  const captureAndShare = async () => {
    try {
      if (!viewShotRef.current?.capture) return;
      const uri = await viewShotRef.current.capture();

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('오류', '이 기기에서는 공유 기능을 사용할 수 없습니다.');
      }
    } catch (e) {
      Alert.alert('캡처 오류', '이미지를 생성하는 데 실패했습니다.');
    }
  };

  const captureAndSave = async () => {
    try {
      if (!status || status.status !== 'granted') {
        const newStatus = await requestPermission();
        if (newStatus.status !== 'granted') {
          Alert.alert('권한 필요', '갤러리에 이미지를 저장하려면 권한이 필요합니다.');
          return;
        }
      }

      if (!viewShotRef.current?.capture) {
        Alert.alert('오류', '캡처 준비가 되지 않았습니다.');
        return;
      }

      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert('저장 완료 🎉', '예쁜 말씀 카드가 앨범에 쏙 들어갔어요!');
    } catch (e: any) {
      console.log('Capture error:', e);
      Alert.alert('저장 오류', `이미지를 저장하는 데 실패했습니다.\n(${e.message})`);
    }
  };

  if (!fontsLoaded) {
    return null; // Return empty view while font is loading
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>말씀 카드 만들기</Text>
          <Text style={styles.headerSubtitle}>마음을 담아 전하는 예쁜 메시지 �</Text>
        </View>

        {/* 편집 영역 (캡처될 ViewShot) */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleTapInteraction}>
          <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 1.0 }}>
            <View
              style={[
                styles.cardCanvas,
                { backgroundColor: selectedTheme.bgColor },
              ]}
            >
              {customImage ? (
                <Image source={{ uri: customImage }} style={styles.backgroundImage} />
              ) : selectedDefaultBg ? (
                <Image source={selectedDefaultBg} style={styles.backgroundImage} />
              ) : null}

              <View style={[styles.overlay, (customImage || selectedDefaultBg) ? styles.darkOverlay : null]}>

                {/* 성경 구절 영역 */}
                <View style={styles.verseContainer}>
                  <Text style={[styles.verseText, (customImage || selectedDefaultBg) && styles.textShadow]}>
                    {currentVerseToShow ? currentVerseToShow : "여기에 말씀이 표시됩니다."}
                  </Text>
                </View>

                {/* 하단 사용자 커스텀 텍스트 */}
                {message ? (
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>
                      {message}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </ViewShot>
        </TouchableOpacity>

        {/* 하단 컨트롤러 영역 */}
        <View style={styles.controls}>

          {/* 1. 테마 선택 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. 감성 테마 선택</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeSelector}>
            {THEMES.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeButton,
                  selectedTheme.id === theme.id && styles.themeButtonActive,
                ]}
                onPress={() => setSelectedTheme(theme)}
              >
                <Text style={[
                  styles.themeButtonText,
                  selectedTheme.id === theme.id && styles.themeButtonTextActive
                ]}>
                  {theme.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 2. 말씀 구절 선택 */}
          <Text style={styles.sectionTitle}>2. 전하고 싶은 말씀</Text>
          <View style={styles.verseOptionsContainer}>
            {selectedTheme.verses.map((verse, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.verseOptionButton,
                  (!isCustomVerse && selectedVerse === verse) && styles.verseOptionActive
                ]}
                onPress={() => {
                  isUserPickedBg.current = false;
                  setIsCustomVerse(false);
                  setSelectedVerse(verse);
                }}
              >
                <Text style={styles.verseOptionText} numberOfLines={2}>
                  {verse}
                </Text>
              </TouchableOpacity>
            ))}

            {/* 직접 입력 옵션 */}
            <TouchableOpacity
              style={[
                styles.verseOptionButton,
                isCustomVerse && styles.verseOptionActive
              ]}
              onPress={() => setIsCustomVerse(true)}
            >
              <Text style={styles.verseOptionTextTitle}>✍️ 내가 원하는 말씀 직접 입력하기</Text>
            </TouchableOpacity>

            {isCustomVerse && (
              <View style={styles.customInputContainer}>
                <View style={styles.apiInputRow}>
                  <TextInput
                    style={[styles.textInput, styles.referenceApiInput]}
                    value={customVerseRef}
                    onChangeText={setCustomVerseRef}
                    placeholder="이사야 44:1 📖"
                  />
                  <TouchableOpacity
                    style={styles.fetchButton}
                    onPress={fetchBibleVerse}
                    disabled={isLoadingVerse}
                  >
                    <Text style={styles.fetchButtonText}>
                      {isLoadingVerse ? "로딩..." : "불러오기"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.textInput, styles.customVerseInput]}
                  value={customVerseText}
                  onChangeText={setCustomVerseText}
                  placeholder="불러오기를 누르거나 원하시는 구절을 적어주세요!"
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}
          </View>

          {/* 3. 배경 사진 설정 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3. 깜찍한 배경 선택</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bgSelector}>
            {DEFAULT_BGS.map((bg, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.bgThumbnailContainer,
                  selectedDefaultBg === bg && styles.bgThumbnailActive
                ]}
                onPress={() => handleSelectDefaultBg(bg)}
              >
                <Image source={bg} style={styles.bgThumbnail} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.rowButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={handlePickImage}>
              <Text style={styles.primaryButtonText}>📸 내 갤러리 사진 쓰기</Text>
            </TouchableOpacity>
          </View>

          {/* 4. 나만의 축복 메시지 */}
          <Text style={styles.sectionTitle}>4. 축복 메시지</Text>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="따뜻한 한마디를 적어보세요 💛"
            maxLength={35}
          />

          <View style={styles.divider} />

          {/* 저장 및 공유 액션 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={captureAndSave}>
              <Text style={styles.saveButtonText}>앨범에 쏙 저장 📥</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={captureAndShare}>
              <Text style={styles.shareButtonText}>친구에게 공유 💌</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2C3E50',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  cardCanvas: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    marginBottom: 24,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  overlay: {
    flex: 1,
    width: '100%',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkOverlay: {
    backgroundColor: 'rgba(0,0,0,0.25)', // 사진 배경일 때 텍스트 가독성을 높여줌
  },
  character: {
    fontSize: 80,
    marginBottom: 24,
    textShadowColor: 'rgba(255, 255, 255, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  verseContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  verseText: {
    fontSize: 19,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '600',
    color: '#34495E',
    letterSpacing: -0.2,
  },
  textShadow: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  messageBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 'auto',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 18,
    fontFamily: 'GamjaFlower',
    color: '#333333',
    letterSpacing: 0.2,
  },
  controls: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C3E50',
    marginTop: 18,
    marginBottom: 12,
  },
  themeSelector: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  themeButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#F0F3F4',
    borderRadius: 25,
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  themeButtonActive: {
    backgroundColor: '#FF9A9E', // 피치-핑크톤 포인트 컬러
  },
  themeButtonText: {
    fontWeight: '700',
    color: '#7F8C8D',
    fontSize: 14,
  },
  themeButtonTextActive: {
    color: '#FFFFFF',
  },
  verseOptionsContainer: {
    gap: 8,
    marginBottom: 10,
  },
  verseOptionButton: {
    padding: 14,
    backgroundColor: '#F8F9F9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECEE',
  },
  verseOptionActive: {
    backgroundColor: '#FDF2E9', // 살구빛 배경
    borderColor: '#F8C471',
  },
  verseOptionText: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
  },
  verseOptionTextTitle: {
    fontSize: 14,
    color: '#D35400',
    fontWeight: '700',
  },
  customInputContainer: {
    marginTop: 8,
    gap: 10,
  },
  customVerseInput: {
    backgroundColor: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  apiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  referenceApiInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    fontWeight: '700',
    color: '#D35400',
  },
  fetchButton: {
    backgroundColor: '#E67E22', // 오렌지 색상
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fetchButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#F39C12', // 따뜻한 오렌지
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  bgSelector: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  bgThumbnailContainer: {
    width: 60,
    height: 75,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bgThumbnailActive: {
    borderColor: '#F39C12', // 활성화 시 오렌지 보더
  },
  bgThumbnail: {
    width: '100%',
    height: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#EAECEE',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    backgroundColor: '#F8F9F9',
    color: '#2C3E50',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAECEE',
    marginVertical: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1ABC9C', // 터키석 에메랄드 그린
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#3498DB', // 시원한 블루
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
