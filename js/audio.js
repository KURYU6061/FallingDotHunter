/**
 * 게임 효과음 관리를 위한 AudioPlayer 클래스
 */
class AudioPlayer {
    constructor() {
        // Web Audio API를 지원하는지 확인
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        
        // 오디오 컨텍스트 생성 (브라우저가 지원할 경우)
        if (AudioContext) {
            this.audioContext = new AudioContext();
        }
        
        // 효과음 버퍼 저장소
        this.sounds = {};
        
        // 효과음 설정
        this.soundEnabled = true;
        this.volume = 0.5;
    }
    
    /**
     * 효과음 사전 로드
     * @param {string} name - 효과음 식별자
     * @param {string} url - 효과음 파일 경로
     */
    async loadSound(name, url) {
        try {
            // AudioContext가 없으면 fallback
            if (!this.audioContext) {
                const audio = new Audio(url);
                audio.preload = 'auto';
                this.sounds[name] = audio;
                return;
            }
            
            // 파일 가져오기
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            
            // 오디오 디코딩
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds[name] = audioBuffer;
        } catch (error) {
            console.error(`효과음 로드 실패 (${name}):`, error);
        }
    }
    
    /**
     * 효과음 재생
     * @param {string} name - 재생할 효과음 식별자
     */
    play(name) {
        if (!this.soundEnabled) {
            console.log(`[AudioPlayer] 음소거 상태 - '${name}' 효과음 재생 취소`);
            return;
        }
        
        try {
            const sound = this.sounds[name];
            
            if (!sound) {
                console.warn(`[AudioPlayer] 효과음 '${name}' 로드되지 않음`);
                return;
            }
            
            console.log(`[AudioPlayer] '${name}' 효과음 재생 시작`);
            
            // AudioContext가 없으면 HTML Audio 사용
            if (!this.audioContext) {
                sound.currentTime = 0;
                sound.volume = this.volume;
                sound.play()
                    .then(() => console.log(`[AudioPlayer] '${name}' HTML Audio 재생 성공`))
                    .catch(err => console.warn('[AudioPlayer] Audio play error:', err));
                return;
            }
            
            // AudioContext 일시정지 상태면 재개
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
                console.log('[AudioPlayer] AudioContext 상태: resumed');
            }
            
            // 소스 노드 생성 및 연결
            const source = this.audioContext.createBufferSource();
            source.buffer = sound;
            
            // 볼륨 조절
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = this.volume;
            
            // 연결 및 재생
            source.connect(gainNode).connect(this.audioContext.destination);
            source.start(0);
            console.log(`[AudioPlayer] '${name}' Web Audio API 재생 성공, 볼륨: ${this.volume}`);
            
            // 효과음 재생 종료 이벤트 추가
            source.onended = () => {
                console.log(`[AudioPlayer] '${name}' 효과음 재생 완료`);
            };
        } catch (error) {
            console.error(`[AudioPlayer] 효과음 재생 실패 (${name}):`, error);
        }
    }
    
    /**
     * 효과음 활성화/비활성화 토글
     * @returns {boolean} 현재 효과음 활성화 상태
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        console.log('[AudioPlayer] 효과음 상태:', this.soundEnabled ? '활성화됨' : '비활성화됨');
        return this.soundEnabled;
    }
    
    /**
     * 효과음 볼륨 설정
     * @param {number} value - 볼륨 (0.0 ~ 1.0)
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }
}

// 게임에서 사용할 오디오 플레이어 인스턴스
const gameAudio = new AudioPlayer();

// 페이지 로드 시 효과음 로드
window.addEventListener('DOMContentLoaded', async () => {
    console.log('[AudioPlayer] 효과음 로드 시작...');
    
    try {
        await gameAudio.loadSound('click', 'sounds/click.mp3');
        console.log('[AudioPlayer] "click" 효과음 로드 완료');
        
        await gameAudio.loadSound('pop', 'sounds/pop.mp3');
        console.log('[AudioPlayer] "pop" 효과음 로드 완료');
        
        await gameAudio.loadSound('button', 'sounds/button.mp3');
        console.log('[AudioPlayer] "button" 효과음 로드 완료');
        
        await gameAudio.loadSound('start', 'sounds/start.mp3');
        console.log('[AudioPlayer] "start" 효과음 로드 완료');
        
        console.log('[AudioPlayer] 모든 효과음이 로드되었습니다.');
        console.log('[AudioPlayer] 현재 효과음 상태:', gameAudio.soundEnabled ? '활성화됨' : '비활성화됨');
        
        // 효과음 상태 확인을 위한 테스트 사운드
        setTimeout(() => {
            if (gameAudio.soundEnabled) {
                console.log('[AudioPlayer] 초기화 테스트: 효과음이 들리는지 확인하세요');
                gameAudio.play('button');
            }
        }, 1000);
    } catch (error) {
        console.error('[AudioPlayer] 효과음 로드 중 오류 발생:', error);
    }
});

// 사용자 상호작용 시 오디오 컨텍스트 활성화
document.addEventListener('click', () => {
    if (gameAudio.audioContext && gameAudio.audioContext.state === 'suspended') {
        gameAudio.audioContext.resume();
    }
}, { once: true });