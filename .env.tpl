# 1Password（必須）。op inject -i .env.tpl -o .env.local で .env.local を生成する
# item 名と field は 00202 で作る item に合わせる（vault は workshop）
RESEND_API_KEY=op://workshop/resend/credential
RESEND_FROM_EMAIL=op://workshop/resend/from-email
