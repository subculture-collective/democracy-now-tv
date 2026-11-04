import { useViewer, Compatibility, ChannelPanel, Library, Screen } from '@subcult/archive-viewer';
import { useState } from 'react';
import { AccountPanel, ChatPanel, FavoriteAction, FavoriteShelf, VideoTools, useChannelChat, usePersonal, useTheater, useViewerLinks, useLibraryLayout } from './ViewerTools';
import './base.css';
import './styles.css';

function Archive() {
  const viewer = useViewer('democracy_now_vid');
  const { theater, setTheater } = useTheater();
  const [layout, setLayout] = useLibraryLayout('democracy_now_vid');
  const [savedOnly, setSavedOnly] = useState(false);
  const personal = usePersonal('democracy_now_vid');
  const chat = useChannelChat('democracy_now_vid', viewer.session, viewer.paused, personal);
  const linkError = useViewerLinks(viewer);
  return <main className={theater ? 'is-theater' : undefined}>
    <a className="skip-link" href="#library">Skip to broadcast archive</a>
    <header className="masthead"><a className="brand" href="/" aria-label="Democracy Now! archive home"><img src="/assets/democracy-now.svg" alt="Democracy Now!" /></a><div className="edition"><p>THE WAR AND PEACE REPORT</p><span>Broadcast archive</span></div><nav aria-label="Main navigation"><a href="#screen">Watch the replay</a><a href="#library">Browse broadcasts</a></nav></header>
    <div className="archive-bar"><span>INDEPENDENT NEWS. A PUBLIC RECORD.</span><span>ON DEMAND / SCHEDULED REPLAY</span></div>
    <section className="screen-layout" aria-label="Broadcast viewing"><Screen viewer={viewer}><div className="news-intro"><div className="photo"><img src="/assets/amy-goodman.png" alt="Amy Goodman reporting with a Democracy Now! microphone" /><span>DEMOCRACY NOW! / FROM THE ARCHIVE</span></div><p className="eyebrow">THE BROADCAST RECORD</p><h1>Return to the report.</h1><p className="lede">Watch a broadcast from the beginning, or join the replay already on the channel. The original date stays with every program.</p></div></Screen><ChannelPanel viewer={viewer} /></section>
    <VideoTools viewer={viewer} theater={theater} onTheater={setTheater} />
    {linkError && <p role="status">{linkError}</p>}
    <div className="library-toolbar" role="group" aria-label="Broadcast archive display"><button aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')}>Grid view</button><button aria-pressed={layout === 'table'} onClick={() => setLayout('table')}>Table view</button><button aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}>{savedOnly ? 'Browse all broadcasts' : 'Show favorites'}</button></div>
    {savedOnly ? <FavoriteShelf viewer={viewer} personal={personal} layout={layout} /> : <Library viewer={viewer} heading="Broadcast archive" mark="DN!" metadataFilters layout={layout} renderActions={episode => <FavoriteAction episode={episode} personal={personal} />} />}
    <AccountPanel personal={personal} product="Democracy Now! TV" />
    <ChatPanel chat={chat} personal={personal} viewer={viewer} />
    <footer><strong>Democracy Now! broadcast archive</strong><span>Independent archive viewer · Video streamed from Internet Archive<br />Original reporting, dates, and source attribution retained.</span><a href="https://www.democracynow.org/" target="_blank" rel="noreferrer">Visit Democracy Now! ↗</a></footer>
  </main>;
}
export default function App() { return <Compatibility collection="democracy_now_vid"><Archive /></Compatibility>; }
