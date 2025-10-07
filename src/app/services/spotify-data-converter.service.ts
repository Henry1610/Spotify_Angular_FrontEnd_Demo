import { Injectable } from '@angular/core';
import { Song } from '../songs';
import { SpotifyTrack, SpotifyPlaylist } from './spotify-api.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyDataConverterService {

  /**
   * Chuyển đổi SpotifyTrack thành Song
   */
  convertSpotifyTrackToSong(spotifyTrack: SpotifyTrack): Song {
    return {
      id: spotifyTrack.id,
      title: spotifyTrack.name,
      artist: spotifyTrack.artists.map(artist => artist.name).join(', '),
      audioSrc: spotifyTrack.preview_url || '', // Preview URL hoặc empty string
      coverSrc: spotifyTrack.album.images.length > 0 ? spotifyTrack.album.images[0].url : '',
      duration: spotifyTrack.duration_ms,
      previewUrl: spotifyTrack.preview_url || undefined,
      externalUrl: spotifyTrack.external_urls.spotify,
      albumName: spotifyTrack.album.name,
      artistId: spotifyTrack.artists[0]?.id,
      albumId: spotifyTrack.album.id,
      isSpotifyTrack: true
    };
  }

  /**
   * Chuyển đổi mảng SpotifyTrack thành mảng Song
   */
  convertSpotifyTracksToSongs(spotifyTracks: SpotifyTrack[]): Song[] {
    return spotifyTracks.map(track => this.convertSpotifyTrackToSong(track));
  }

  /**
   * Chuyển đổi SpotifyPlaylist thành format playlist cho sidebar
   */
  convertSpotifyPlaylistToPlaylist(spotifyPlaylist: SpotifyPlaylist): any {
    return {
      id: spotifyPlaylist.id,
      title: spotifyPlaylist.name,
      description: `${spotifyPlaylist.description || 'Playlist'} • ${spotifyPlaylist.tracks.total} bài hát`,
      image: spotifyPlaylist.images.length > 0 ? spotifyPlaylist.images[0].url : '',
      isActive: false,
      owner: spotifyPlaylist.owner.display_name
    };
  }

  /**
   * Chuyển đổi mảng SpotifyPlaylist thành mảng playlist cho sidebar
   */
  convertSpotifyPlaylistsToPlaylists(spotifyPlaylists: SpotifyPlaylist[]): any[] {
    return spotifyPlaylists.map(playlist => this.convertSpotifyPlaylistToPlaylist(playlist));
  }
}