export interface DisplayLyric {
    lyric: string;
    song: string;
    year: number;
    artist_name: string;
    artist_query: string;
    has_profile_img: boolean;
    added_on?: Date;
  }
  
  export interface Artist {
    artist_id: string;
    name: string;
    has_profile_img: boolean;
    description: string;
    related_artists: string[] | null;
    lyrics?: Lyric[];
  }
  
  export interface Lyric {
    artist_id: string;
    lyric: string;
    song: string;
    explicit: boolean;
    year: number;
    explanation: string | null;
  }
  
  export interface RelatedArtist {
    name: string;
    profile_img: string;
    query: string;
  }