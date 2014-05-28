<?php
/**
 * The template for displaying the home page.
 *
 * @package socket.io-website
 */
?>

<?php get_header(); ?>
<div id="primary" class="content-area">
	<main id="main page home" class="site-main" role="main">
		<header class="entry-header fading">
			<h1 class="entry-title">SOCKET.IO 1.0 IS HERE</h1>
			<h2 class="entry-subtitle">FEATURING THE FASTEST AND MOST RELIABLE REAL-TIME ENGINE</h2>
		</header><!-- .entry-header -->
    <div id="screen-fill">
      <script type="text/html" id="tweets-tpl">
        <div class="window editor fading">
          <div class="header">
            <span class="bullet bullet-red"></span><span class="bullet bullet-yellow"></span><span class="bullet bullet-green"></span><span class="title">~/Projects/tweets/index.js</span>
          </div>
          <div class="body">
            <ol class="code">
              <li><span class="code"><span class="v">var</span> io = <span class="io">require('socket.io')(80)</span>;</span></li>
              <li><span class="code"><span class="v">var</span> cfg = require('./config.json');</span></li>
              <li><span class="code"><span class="v">var</span> tw = require('node-tweet-stream')(cfg);</span></li>
              <li><span class="code">tw.track('socket.io');</span></li>
              <li><span class="code">tw.track('javascript');</span></li>
              <li><span class="code">tw.on('tweet', <span class="fn">function</span>(tweet){</span></li>
              <li><span class="code">&nbsp;&nbsp;<span class="io">io.emit('tweet', tweet)</span>;</span></li>
              <li><span class="code">});</span></li>
            </ol>
          </div>
        </div>

        <div class="window browser fading">
          <div class="header">
            <span class="bullet bullet-red"></span><span class="bullet bullet-yellow"></span><span class="bullet bullet-green"></span><span class="title"><span class="scheme">https://</span>your-node-app.com</span>
          </div>
          <div class="body">
            <p>Tweets about <b>socket.io</b> and <b>javascript</b></p>
            <ul id="tweets" class="tweets"></ul>
          </div>
        </div>
      </script>

      <span class="arrow fading">B</span>
    </div>

		<div class="entry-content">
			<p class="centered">
				<i class="larger">Socket.IO enables real-time bidirectional event-based communication.</i><br />
				<i>It works on every platform, browser or device, focusing equally on reliability and speed.</i>
			</p>

			<div id="entries">
				<div id="examples">
					<div class="example-column left">
						<div class="example-entry icon analytics">
							<h2>Real-time analytics</h2>
							<p>Push data to clients that gets represented as real-time counters, charts or logs.</p>
						</div>
						<div class="repel"></div>
						<div class="example-entry icon binary">
							<h2>Binary streaming</h2>
							<p>Starting in 1.0, it's possible to send any blob back and forth: image, audio, video.</p>
						</div>
					</div>

					<div class="example-column right">
						<div class="example-entry icon chat">
							<h2>Instant messaging and chat</h2>
							<p>Socket.IO's "Hello world" is a chat app in just a few lines of code.</p>
						</div>
						<div class="repel"></div>
						<div class="example-entry icon collab">
							<h2>Document collaboration</h2>
							<p>Allow users to concurrently edit a document and see each other's changes.</p>
						</div>
					</div>
				</div><!-- #examples -->

				<div id="information">
					<div class="information-column left">
						<div class="information-entry">
							<h3>USED BY EVERYONE</h3>
							<p>From Microsoft Office, Yammer, Zendesk, Trello... to hackathon winners and little startups.</p>
							<p>One of the most powerful JavaScript frameworks on GitHub, and most depended-upon NPM module.</p>
						</div>
						<div class="repel"></div>
						<div class="information-entry">
							<h3>STAY UP TO DATE</h3>
							<p>Leave your email to hear about <b>new releases</b> and important <b>security</b> updates. <b>Very low traffic.</b></p>
							<?php if ( function_exists( 'mc4wp_form' ) ) mc4wp_form(); ?>
						</div>
					</div>

					<div class="information-column right">
						<div class="information-entry">
							<h3>IMMENSELY POWERFUL, YET EASY TO USE</h3>
							<p>Our getting started guide will show you how to create lots of amazing applications in fewer than 200 lines of code.</p>
							<p>We're not making that up. Get started <a href="#">now</a>.</p>
						</div>
						<div class="repel"></div>
						<div class="information-entry">
							<h3>JOIN THE COMMUNITY</h3>
							<ul style="margin-left: 0px; list-style-type: none;">
								<li style="margin-bottom: 5px;">Post to the <a href="#">mailing list</a> with questions or to show your work</li>
								<li style="margin-bottom: 5px;">Real-time help? Find us on IRC at #socket.io on irc.freenode.net</li>
								<li style="margin-bottom: 5px;">Contribute code or report issues on <a href="https://github.com/LearnBoost/socket.io">GitHub</a></li>
							</ul>
						</div>
					</div>
				</div><!-- #information -->
			</div><!-- #entries -->
		</div><!-- .entry-content -->
	</main><!-- #main -->
</div><!-- #primary -->

<?php get_footer(); ?>
