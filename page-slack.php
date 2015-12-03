<?php
/*
* Template Name: Slack
*/

get_header(); ?>

<?php
  $redis = new TinyRedisClient('localhost:6379');
?>

  <div id="primary" class="content-area">
    <main id="main" class="site-main" role="main">

      <h1 class="entry-title">Join the Community</h1>
      <h2 class="entry-subtitle">LEARN, DISCUSS, SHARE, CONTRIBUTE</h2>
      <p>Join our <a href="http://socketio.slack.com" target="_blank">Slack</a> server to discuss the project in realtime.</p>
      <ul>
        <li><b>Talk</b> to the core devs and the Socket.IO community.</li>
        <li><b>Learn</b> from others and ask questions.</li>
        <li><b>Share</b> your work and demos.</li>
      </ul>
<p>Enter your email to join the Socket.IO community Slack 
  <a href="http://socketio.slack.com" target="_blank">server</a>:</p>
      <form action="">
        <p><input type="text" placeholder="you@host.com" /></p>
      </form>
      <p id="join-footer">At this time 
        <b class="slack-users-count"><?php echo $redis->get('slack_users_count') ?></b> people
        are active out of <b class="slack-users-count-total"><?php echo $redis->get('slack_users_count_total') ?></b> registered users.</p>
      <p>Please be nice, respectful and inclusive of others!</p>
    </main>
  </div>
  
<style>
 #primary form p input[type="text"] {
   width: 100%;
 }
 h2.entry-subtitle {
   margin-bottom: 50px;
 }
 p {
   margin-bottom: 5px;
 }
 ul {
   margin: 20px 20px;
 }
 form p {
   margin-bottom: 0;
 }
 .error {
   color: red;
 }
 #join-footer {
   margin-top: 20px;
 }
 
@media screen and (max-width: 900px) {
  form {
   margin-left: 0;
  }
}
</style>

<script src="/wp-content/themes/socket.io-website/js/superagent.js"></script>
<script>
var form = document.querySelector('form');
var input = document.querySelector('input[type=text]');
var request = superagent;
form.addEventListener('submit', function(ev){
  ev.preventDefault();
  request
  .post('http://slack-io.socket.io/invite')
  .send({ email: input.value })
  .end(function(res){
    if (res.ok) {
      form.innerHTML = '<b>Success!</b> Check <em>' + input.value + '</em> for an invite from Slack.';
    } else { button.removeAttribute('disabled');
      if (res.body.error) {
        $('form').find('.error').remove();
        $('form').append(
          $('<p class="error">').text(res.body.error)
        );
      } else {
        alert('An error occurred. Please try again');
      }
    }
  });
});
</script>

<?php get_footer(); ?>
